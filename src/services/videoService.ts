import { supabase } from '../lib/supabase';
import { Video } from '../data/videos';
import { CategoryId } from '../data/categories';

type Row = {
  id: string;
  youtube_id: string;
  title: string;
  source: string;
  category: string;
  description: string;
  duration: string;
  language: 'en' | 'ar';
};

function toVideo(row: Row): Video {
  return {
    id:          row.id,
    youtubeId:   row.youtube_id,
    title:       row.title,
    source:      row.source,
    category:    row.category as CategoryId,
    description: row.description,
    duration:    row.duration,
    language:    row.language,
  };
}

async function query(filter?: { column: string; value: string }): Promise<Video[]> {
  if (!supabase) return [];
  let q = supabase.from('videos').select('*').order('created_at', { ascending: false });
  if (filter) q = q.eq(filter.column, filter.value);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Row[]).map(toVideo);
}

export const videoService = {
  getAll: (): Promise<Video[]> => query(),

  getByCategory: (category: CategoryId): Promise<Video[]> =>
    category === 'all' ? query() : query({ column: 'category', value: category }),

  getByYoutubeIds: async (youtubeIds: string[]): Promise<Video[]> => {
    if (!supabase || youtubeIds.length === 0) return [];
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .in('youtube_id', youtubeIds);
    if (error) throw error;
    return (data as Row[]).map(toVideo);
  },

  getThumbnailUrl: (youtubeId: string): string =>
    `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,

  getEmbedUrl: (youtubeId: string): string => {
    const p = new URLSearchParams({ autoplay: '1', rel: '0', modestbranding: '1', playsinline: '1' });
    return `https://www.youtube.com/embed/${youtubeId}?${p}`;
  },
};
