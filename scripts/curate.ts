#!/usr/bin/env tsx
import 'dotenv/config';
/**
 * LightFeed Video Curation Agent
 *
 * Searches YouTube for beneficial content, fetches exact durations, filters
 * with Claude, and posts approved videos directly to Supabase.
 *
 * Setup:
 *   1. Run supabase/schema.sql in your Supabase SQL editor
 *   2. Fill in .env (copy from .env.example)
 *   3. npm run curate -- --category quran --lang ar
 *      npm run curate -- --scholar "طارق السويدان" --category spiritual
 *      npm run curate -- --category hadith --lang en --count 15 --dry-run
 *
 * Flags:
 *   --category   quran | hadith | spiritual | discipline | family | income | growth | all
 *   --scholar    Scholar name or Arabic name (e.g. "طارق السويدان")
 *   --lang       en | ar | both  (default: both)
 *   --count      Max videos to insert (default: 20)
 *   --dry-run    Print results without inserting into Supabase
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Lang = 'en' | 'ar';

interface SearchConfig {
  query: string;
  lang: Lang;
  scholarName?: string;
}

interface YouTubeResult {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  duration: string;  // parsed to "M:SS"
  lang: Lang;
}

interface CuratedVideo {
  youtubeId: string;
  title: string;
  source: string;
  category: string;
  description: string;
  duration: string;
  language: Lang;
}

// ---------------------------------------------------------------------------
// Known scholars to always include in searches
// ---------------------------------------------------------------------------

const KNOWN_SCHOLARS: Array<{ name: string; query: string; lang: Lang }> = [
  { name: 'Tariq Al-Suwaidan', query: 'طارق السويدان',              lang: 'ar' },
  { name: 'Nouman Ali Khan',   query: 'nouman ali khan',             lang: 'en' },
  { name: 'Mufti Menk',       query: 'mufti menk',                  lang: 'en' },
  { name: 'Omar Suleiman',    query: 'omar suleiman',               lang: 'en' },
  { name: 'Hamza Yusuf',      query: 'hamza yusuf',                 lang: 'en' },
  { name: 'Yasir Qadhi',      query: 'yasir qadhi',                 lang: 'en' },
  { name: 'Bilal Assad',      query: 'bilal assad reminder',        lang: 'en' },
  { name: 'محمد الغليظ',     query: 'محمد الغليظ خواطر',           lang: 'ar' },
];

// ---------------------------------------------------------------------------
// Category generic queries (language-aware)
// ---------------------------------------------------------------------------

const CATEGORY_QUERIES: Record<string, { en: string[]; ar: string[] }> = {
  quran: {
    en: ['quran reflection short reminder', 'quran verse meaning short clip'],
    ar: ['طارق السويدان قرآن تأمل', 'تأمل قرآني قصير مؤثر', 'خواطر قرآنية قصيرة'],
  },
  hadith: {
    en: ['hadith reminder short clip', 'sunnah reminder two minutes'],
    ar: ['حديث نبوي قصير مؤثر', 'تذكير بحديث نبوي', 'سنة نبوية تذكير'],
  },
  spiritual: {
    en: ['islamic spiritual reminder short', 'dhikr tawakkul reminder'],
    ar: ['تذكير روحي إسلامي قصير', 'ذكر وتوكل على الله قصير', 'خاطرة روحية قصيرة'],
  },
  discipline: {
    en: ['islamic self discipline reminder short', 'controlling nafs islam short'],
    ar: ['تزكية النفس قصير', 'ضبط النفس إسلامي تذكير', 'مجاهدة النفس قصير'],
  },
  family: {
    en: ['islamic family reminder short', 'parents rights islam short'],
    ar: ['بر الوالدين تذكير قصير', 'الأسرة المسلمة خاطرة قصيرة', 'حقوق الأهل في الإسلام'],
  },
  income: {
    en: ['halal income barakah reminder short', 'rizq honest earning islam'],
    ar: ['الرزق الحلال تذكير قصير', 'بركة الرزق إسلام خاطرة', 'الكسب الحلال تذكير'],
  },
  growth: {
    en: ['islamic personal growth reminder short', 'muslim self improvement short'],
    ar: ['تطوير الذات إسلامي قصير', 'النمو الشخصي من منظور إسلامي', 'خاطرة تحفيزية إسلامية'],
  },
};

// ---------------------------------------------------------------------------
// Parse ISO 8601 duration → "M:SS" or "H:MM:SS"
// ---------------------------------------------------------------------------

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '0:00';
  const h = parseInt(m[1] ?? '0', 10);
  const min = parseInt(m[2] ?? '0', 10);
  const s = parseInt(m[3] ?? '0', 10);
  if (h > 0) return `${h}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${min}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// YouTube: search
// ---------------------------------------------------------------------------

async function searchYouTube(
  config: SearchConfig,
  apiKey: string,
  maxResults = 6,
): Promise<{ videoId: string; title: string; description: string; channelTitle: string }[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    q: config.query,
    type: 'video',
    videoDuration: 'short',       // < 4 minutes
    maxResults: String(maxResults),
    relevanceLanguage: config.lang,
    safeSearch: 'strict',
    key: apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status} ${await res.text()}`);

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
// YouTube: fetch durations for a batch of video IDs
// ---------------------------------------------------------------------------

async function fetchDurations(videoIds: string[], apiKey: string): Promise<Record<string, string>> {
  if (videoIds.length === 0) return {};
  const params = new URLSearchParams({
    part: 'contentDetails',
    id: videoIds.join(','),
    key: apiKey,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
  if (!res.ok) return {};
  const data = await res.json() as {
    items?: Array<{ id: string; contentDetails: { duration: string } }>;
  };
  const out: Record<string, string> = {};
  for (const item of data.items ?? []) {
    out[item.id] = parseDuration(item.contentDetails.duration);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Claude: filter and describe
// ---------------------------------------------------------------------------

async function filterWithClaude(
  results: YouTubeResult[],
  category: string,
  client: Anthropic,
  availableCategories: string[],
): Promise<CuratedVideo[]> {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `You are the content curator for LightFeed — a beneficial Islamic short-form video app.

${category === 'all'
  ? `Assign each approved video to the most fitting category from: ${availableCategories.join(', ')}`
  : `Category for all approved videos: **${category}**`}

Content rules — REJECT if any apply:
- Not in English or Arabic (reject other languages)
- Political, sectarian, or controversial content
- Guilt-based or fear-mongering tone
- Not genuinely Islamic or beneficial
- Primarily entertainment without religious benefit
- Unknown or unvetted channel (unless content is clearly beneficial)

APPROVE if:
- Content is from a well-known, trusted Islamic scholar or reputable channel
- Tone is calm, uplifting, and encouraging
- Clearly beneficial and appropriate for all Muslims
- Language is English or Arabic only

Videos to evaluate:
${JSON.stringify(results.map(r => ({
  videoId: r.videoId,
  title: r.title,
  description: r.description.slice(0, 200),
  channel: r.channelTitle,
  duration: r.duration,
  lang: r.lang,
})), null, 2)}

Return a JSON array of APPROVED videos only. Write each description in a calm, encouraging tone (1–2 sentences, in English regardless of the video language). If nothing qualifies, return [].

[
  {
    "youtubeId": "...",
    "title": "clean readable title",
    "source": "scholar or channel name",
    "category": "${category === 'all' ? 'one of: ' + availableCategories.join(', ') : category}",
    "description": "What the viewer will benefit from. Calm, encouraging English sentence.",
    "duration": "M:SS",
    "language": "en" or "ar"
  }
]`,
    }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { return JSON.parse(match[0]) as CuratedVideo[]; }
  catch { console.error('Could not parse Claude response'); return []; }
}

// ---------------------------------------------------------------------------
// Supabase: insert approved videos
// ---------------------------------------------------------------------------

async function insertToSupabase(videos: CuratedVideo[], supabaseUrl: string, serviceRoleKey: string) {
  const db = createClient(supabaseUrl, serviceRoleKey);
  const rows = videos.map(v => ({
    youtube_id:  v.youtubeId,
    title:       v.title,
    source:      v.source,
    category:    v.category,
    description: v.description,
    duration:    v.duration,
    language:    v.language,
  }));

  const { data, error } = await db
    .from('videos')
    .upsert(rows, { onConflict: 'youtube_id', ignoreDuplicates: true })
    .select('youtube_id');

  if (error) throw error;
  return (data ?? []).length;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const get  = (flag: string, fallback: string) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
  };

  const category   = get('--category', 'quran');
  const scholarArg = get('--scholar', '');
  const langArg    = get('--lang', 'both') as Lang | 'both';
  const count      = parseInt(get('--count', '20'), 10);
  const dryRun     = args.includes('--dry-run');

  const youtubeKey     = process.env.YOUTUBE_API_KEY;
  const anthropicKey   = process.env.ANTHROPIC_API_KEY;
  const supabaseUrl    = process.env.SUPABASE_URL;
  const supabaseKey    = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!youtubeKey)   { console.error('❌  YOUTUBE_API_KEY missing');           process.exit(1); }
  if (!anthropicKey) { console.error('❌  ANTHROPIC_API_KEY missing');         process.exit(1); }
  if (!dryRun && (!supabaseUrl || !supabaseKey)) {
    console.error('❌  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing (use --dry-run to skip DB)');
    process.exit(1);
  }

  // Build search configs
  const searches: SearchConfig[] = [];
  const langs: Lang[] = langArg === 'both' ? ['en', 'ar'] : [langArg];

  const categoriesToRun =
    category === 'all' ? Object.keys(CATEGORY_QUERIES) : [category];

  if (scholarArg) {
    // Scholar-specific: search by name across requested languages
    for (const lang of langs) {
      searches.push({ query: `${scholarArg} short reminder`, lang, scholarName: scholarArg });
    }
  } else {
    // Category queries + well-known scholars
    for (const cat of categoriesToRun) {
      const catQueries = CATEGORY_QUERIES[cat];
      for (const lang of langs) {
        for (const q of catQueries[lang]) {
          searches.push({ query: q, lang });
        }
      }
    }
    // Add relevant scholars for requested languages (once, not per category)
    for (const scholar of KNOWN_SCHOLARS) {
      if (langs.includes(scholar.lang)) {
        searches.push({
          query: `${scholar.query} تذكير قصير OR short reminder`,
          lang: scholar.lang,
          scholarName: scholar.name,
        });
      }
    }
  }

  const client = new Anthropic({ apiKey: anthropicKey });

  console.log(`\n✦ LightFeed Curator`);
  console.log(`  Category : ${category}`);
  console.log(`  Language : ${langArg}`);
  console.log(`  Scholar  : ${scholarArg || '(all known scholars)'}`);
  console.log(`  Dry run  : ${dryRun}\n`);

  // Search YouTube
  const raw: Array<{ videoId: string; title: string; description: string; channelTitle: string; lang: Lang }> = [];
  for (const cfg of searches) {
    process.stdout.write(`  🔍 "${cfg.query}" [${cfg.lang}] … `);
    const results = await searchYouTube(cfg, youtubeKey, 5);
    console.log(`${results.length} results`);
    raw.push(...results.map(r => ({ ...r, lang: cfg.lang })));
  }

  // Deduplicate by videoId
  const unique = Array.from(new Map(raw.map(r => [r.videoId, r])).values());
  console.log(`\n  ${unique.length} unique candidates`);

  // Fetch durations in one batch call
  process.stdout.write('  ⏱  Fetching durations … ');
  const durations = await fetchDurations(unique.map(r => r.videoId), youtubeKey);
  console.log('done');

  const withDuration: YouTubeResult[] = unique.map(r => ({
    ...r,
    duration: durations[r.videoId] ?? '?:??',
  }));

  // Claude filter
  process.stdout.write('  🤖 Claude reviewing … ');
  const approved = await filterWithClaude(withDuration, category, client, Object.keys(CATEGORY_QUERIES));
  console.log(`${approved.length} approved\n`);

  if (approved.length === 0) {
    console.log('⚠️  Nothing approved. Try different queries or a broader --lang.');
    return;
  }

  const toInsert = approved.slice(0, count);

  // Print results
  console.log('Approved videos:');
  toInsert.forEach((v, i) => {
    console.log(`  ${i + 1}. [${v.language.toUpperCase()}] ${v.title} — ${v.source} (${v.duration})`);
  });

  if (dryRun) {
    console.log('\n[dry-run] Not inserted. Remove --dry-run to post to Supabase.');
    return;
  }

  // Insert to Supabase
  process.stdout.write('\n  📦 Inserting to Supabase … ');
  const inserted = await insertToSupabase(toInsert, supabaseUrl!, supabaseKey!);
  console.log(`${inserted} new rows added (duplicates skipped)\n`);
  console.log('✅  Done. Refresh your LightFeed app to see the new videos.');
}

main().catch(err => { console.error(err); process.exit(1); });
