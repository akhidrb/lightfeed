export type CategoryId =
  | 'all'
  | 'quran'
  | 'hadith'
  | 'spiritual'
  | 'discipline'
  | 'family'
  | 'income'
  | 'growth'
  | 'prophets'
  | 'science'
  | 'news';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'all',        label: 'All',            icon: '✦'  },
  { id: 'quran',      label: "Qur'an",         icon: '📖' },
  { id: 'hadith',     label: 'Hadith',         icon: '🌿' },
  { id: 'spiritual',  label: 'Spiritual',      icon: '🤍' },
  { id: 'prophets',   label: 'Prophets',       icon: '📿' },
  { id: 'science',    label: 'Science & Nature', icon: '🔭' },
  { id: 'news',       label: 'News & World',   icon: '🌍' },
  { id: 'discipline', label: 'Discipline',     icon: '⚡' },
  { id: 'family',     label: 'Family',         icon: '🏡' },
  { id: 'income',     label: 'Halal Income',   icon: '💼' },
  { id: 'growth',     label: 'Growth',         icon: '🌱' },
];

export const getCategoryById = (id: CategoryId): Category =>
  CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0];
