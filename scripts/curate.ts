#!/usr/bin/env tsx
/**
 * LightFeed Video Curation Agent
 *
 * Searches YouTube for beneficial Islamic content and uses Claude to filter
 * results against LightFeed's content guidelines. Outputs video objects ready
 * to paste into src/data/videos.ts.
 *
 * Setup:
 *   1. Enable YouTube Data API v3 at https://console.cloud.google.com/
 *   2. Copy .env.example to .env and fill in both keys
 *   3. Run: npm run curate -- --category quran --count 10
 *
 * Available categories: quran | hadith | spiritual | discipline | family | income | growth
 */

import Anthropic from '@anthropic-ai/sdk';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface YouTubeResult {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
}

interface CuratedVideo {
  youtubeId: string;
  title: string;
  source: string;
  category: string;
  description: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Category search queries
// ---------------------------------------------------------------------------

const QUERIES: Record<string, string[]> = {
  quran: [
    'quran reflection reminder short',
    'quran tafsir one minute reminder',
    'beautiful quran verse meaning short',
  ],
  hadith: [
    'hadith reminder short clip',
    'sunnah reminder two minutes',
    'prophet muhammad hadith short reminder',
  ],
  spiritual: [
    'islamic spiritual reminder short',
    'dhikr tawakkul reminder short clip',
    'islamic heart reminder short',
  ],
  discipline: [
    'islamic self discipline reminder short',
    'controlling nafs islam short clip',
    'islamic mindset reminder short',
  ],
  family: [
    'islamic family reminder short clip',
    'parents rights islam short',
    'marriage kindness islam reminder',
  ],
  income: [
    'halal income barakah reminder short',
    'rizq honest earning islam reminder',
    'islamic work ethics reminder short',
  ],
  growth: [
    'islamic personal growth reminder short',
    'muslim self improvement reminder',
    'islamic wisdom daily reminder short',
  ],
};

// ---------------------------------------------------------------------------
// YouTube search
// ---------------------------------------------------------------------------

async function searchYouTube(query: string, apiKey: string, maxResults = 8): Promise<YouTubeResult[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    videoDuration: 'short',   // under 4 minutes
    maxResults: String(maxResults),
    relevanceLanguage: 'en',
    safeSearch: 'strict',
    key: apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body}`);
  }

  const data = await res.json() as {
    items?: Array<{
      id: { videoId: string };
      snippet: { title: string; description: string; channelTitle: string };
    }>;
  };

  return (data.items ?? []).map(item => ({
    videoId:      item.id.videoId,
    title:        item.snippet.title,
    description:  item.snippet.description,
    channelTitle: item.snippet.channelTitle,
  }));
}

// ---------------------------------------------------------------------------
// Claude filter
// ---------------------------------------------------------------------------

async function filterWithClaude(
  results: YouTubeResult[],
  category: string,
  client: Anthropic,
): Promise<CuratedVideo[]> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `You are the content curator for LightFeed — a beneficial short-form video app for Muslims.

Category being curated: **${category}**

Content must meet ALL of these criteria:
- Genuinely beneficial, Islamic, and uplifting
- Calm and respectful tone — no aggression or lecturing
- No political, sectarian, or controversial content
- No guilt-based or fear-mongering language
- Prefer well-known trusted scholars or reputable Islamic channels
- Appropriate for all ages

Here are YouTube search results to evaluate:
${JSON.stringify(results, null, 2)}

Return a JSON array of APPROVED videos only. Write each description in a calm, encouraging tone (1–2 sentences). If nothing qualifies, return [].

Format:
[
  {
    "youtubeId": "...",
    "title": "clean readable title",
    "source": "channel or scholar name",
    "category": "${category}",
    "description": "What the viewer will benefit from. Calm tone.",
    "reason": "Why approved"
  }
]`,
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];

  try {
    return JSON.parse(match[0]) as CuratedVideo[];
  } catch {
    console.error('Could not parse Claude response as JSON');
    return [];
  }
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const get  = (flag: string, fallback: string) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
  };

  const category   = get('--category', 'quran');
  const count      = parseInt(get('--count', '10'), 10);
  const youtubeKey = process.env.YOUTUBE_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!youtubeKey)    { console.error('❌  Set YOUTUBE_API_KEY in .env');    process.exit(1); }
  if (!anthropicKey)  { console.error('❌  Set ANTHROPIC_API_KEY in .env');  process.exit(1); }

  const queries = QUERIES[category];
  if (!queries) {
    console.error(`❌  Unknown category "${category}". Options: ${Object.keys(QUERIES).join(', ')}`);
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: anthropicKey });

  console.log(`\n🔍  Searching YouTube — category: ${category}\n`);

  const all: YouTubeResult[] = [];
  for (const query of queries) {
    process.stdout.write(`  "${query}" ... `);
    const results = await searchYouTube(query, youtubeKey, 6);
    console.log(`${results.length} results`);
    all.push(...results);
  }

  // Deduplicate by videoId
  const unique = Array.from(new Map(all.map(r => [r.videoId, r])).values());
  console.log(`\n✦  ${unique.length} unique candidates → asking Claude to review...\n`);

  const approved = await filterWithClaude(unique, category, client);

  if (approved.length === 0) {
    console.log('⚠️  No videos approved. Try a different category or refine your queries.');
    return;
  }

  console.log(`✅  ${approved.length} approved\n`);
  console.log('Add these to src/data/videos.ts:\n');
  console.log('// ── Curated by AI agent ──────────────────────────────');
  approved.slice(0, count).forEach((v, i) => {
    const escape = (s: string) => s.replace(/'/g, "\\'");
    console.log(`  {
    id: 'v_${category}_${i + 1}',
    youtubeId: '${v.youtubeId}',
    title: '${escape(v.title)}',
    source: '${escape(v.source)}',
    category: '${v.category}',
    description: '${escape(v.description)}',
    duration: 'X:XX', // fill in manually
  },`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
