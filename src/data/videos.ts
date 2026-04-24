import { CategoryId } from './categories';

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  source: string;
  category: CategoryId;
  description: string;
  duration: string;
}

// Sample curated data. Replace youtubeId values with real IDs from:
//   npm run curate -- --category quran
export const VIDEOS: Video[] = [
  {
    id: 'v_quran_1',
    youtubeId: '0jOMewDuqMI',
    title: 'How to Calm a Turbulent Heart',
    source: 'Nouman Ali Khan – Bayyinah',
    category: 'quran',
    description: 'Ustadh Nouman Ali Khan shares a gentle reflection from Surah Al-Muzzammil on finding peace and stillness through the Quran.',
    duration: 'X:XX', // fill in manually
  },
  {
    id: 'v_quran_2',
    youtubeId: 'Xlf70K7yPZ8',
    title: 'Ayat Al-Kursi – Arabic and English Translation',
    source: 'The Meaning Of Islam',
    category: 'quran',
    description: 'A clear and beautiful presentation of Ayat Al-Kursi with its Arabic recitation and English translation — a timeless verse loved by all Muslims.',
    duration: 'X:XX', // fill in manually
  },
  {
    id: 'v_quran_3',
    youtubeId: 'P3iu3IOQzus',
    title: 'Nothing is Changing? Here\'s a Reminder on Dua and Sabr',
    source: 'Nouman Ali Khan – FreeQuranEducation',
    category: 'quran',
    description: 'A warm and grounding reminder from Nouman Ali Khan on pairing sincere dua with patience, drawing wisdom from the Quran.',
    duration: 'X:XX', // fill in manually
  },
  {
    id: 'v_quran_4',
    youtubeId: 'WR-5zy5L-uo',
    title: 'Why Was the Quran Revealed in Stages?',
    source: 'One Minute Reminder',
    category: 'quran',
    description: 'A thoughtful one-minute reflection on the wisdom behind the gradual revelation of the Quran — a beautiful reminder of Allah\'s mercy in guidance.',
    duration: 'X:XX', // fill in manually
  },
  {
    id: 'v_quran_5',
    youtubeId: 'uIXNG3MlKcI',
    title: 'The Quran Teaches Patience',
    source: 'A Journey Through Faiths',
    category: 'quran',
    description: 'A gentle one-minute reminder drawn from Surah Al-Baqarah on how the Quran guides us toward patience and hope in difficult times.',
    duration: 'X:XX', // fill in manually
  },
];
