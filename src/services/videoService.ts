import { VIDEOS, Video } from '../data/videos';
import { CategoryId } from '../data/categories';

export const videoService = {
  getAll: (): Video[] => VIDEOS,

  getByCategory: (category: CategoryId): Video[] =>
    category === 'all' ? VIDEOS : VIDEOS.filter(v => v.category === category),

  getById: (id: string): Video | undefined => VIDEOS.find(v => v.id === id),

  getByIds: (ids: string[]): Video[] =>
    ids.map(id => VIDEOS.find(v => v.id === id)).filter(Boolean) as Video[],

  getThumbnailUrl: (youtubeId: string): string =>
    `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,

  getEmbedUrl: (youtubeId: string): string => {
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
    });
    return `https://www.youtube.com/embed/${youtubeId}?${params}`;
  },
};
