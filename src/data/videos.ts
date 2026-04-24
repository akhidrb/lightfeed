import { CategoryId } from './categories';

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  source: string;
  category: CategoryId;
  description: string;
  duration: string;
  language?: 'en' | 'ar';
}
