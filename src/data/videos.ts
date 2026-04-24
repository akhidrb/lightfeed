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
    id: 'v1',
    youtubeId: 'qNHHKf5CROU',
    title: 'The Power of Bismillah',
    source: 'Mufti Menk',
    category: 'quran',
    description: 'Every great action begins with the name of Allah. A gentle reminder of the barakah that flows from starting with Bismillah.',
    duration: '2:14',
  },
  {
    id: 'v2',
    youtubeId: 'vBNazFa2aqM',
    title: 'Gratitude in Hard Times',
    source: 'Omar Suleiman',
    category: 'spiritual',
    description: 'True shukr is not just when life is easy. This reminder helps us see the hidden blessings in our trials.',
    duration: '3:02',
  },
  {
    id: 'v3',
    youtubeId: 'y07fYnDFUFk',
    title: "The Believer's Patience",
    source: 'Nouman Ali Khan',
    category: 'hadith',
    description: 'The Prophet ﷺ told us that the affair of a believer is amazing — both ease and hardship become good for him.',
    duration: '2:45',
  },
  {
    id: 'v4',
    youtubeId: 'wBnLRLqP83c',
    title: 'Taming the Nafs',
    source: 'Hamza Yusuf',
    category: 'discipline',
    description: 'A short reflection on how controlling the lower self is the greatest struggle — and the key to inner peace.',
    duration: '3:30',
  },
  {
    id: 'v5',
    youtubeId: '8oOTMqZ8ues',
    title: 'Be Good to Your Parents',
    source: 'Mufti Menk',
    category: 'family',
    description: "Allah mentions parents right alongside Himself in the Qur'an. A gentle reminder of their sacred status.",
    duration: '2:18',
  },
  {
    id: 'v6',
    youtubeId: 'TqgBBNF0eoU',
    title: 'Barakah in Your Rizq',
    source: 'Omar Suleiman',
    category: 'income',
    description: 'How to invite blessing into your earnings through honesty, sadaqah, and sincere reliance on Allah.',
    duration: '2:55',
  },
  {
    id: 'v7',
    youtubeId: 'kfgSUNFVNgQ',
    title: 'Small Steps, Great Rewards',
    source: 'Nouman Ali Khan',
    category: 'growth',
    description: 'The Prophet ﷺ loved consistent deeds even if small. A short clip to encourage intentional daily growth.',
    duration: '1:58',
  },
  {
    id: 'v8',
    youtubeId: 'L_ZE7f7KFIQ',
    title: 'Reflecting on Surah Al-Fatiha',
    source: 'Bayyinah TV',
    category: 'quran',
    description: 'We recite it seventeen times a day — but do we truly hear it? A deep yet accessible reflection.',
    duration: '3:10',
  },
  {
    id: 'v9',
    youtubeId: 'QGJuMBdaqIw',
    title: 'The Peace of Dhikr',
    source: 'Hamza Yusuf',
    category: 'spiritual',
    description: 'Truly, in the remembrance of Allah do hearts find rest. A reminder on making dhikr a living habit.',
    duration: '2:40',
  },
  {
    id: 'v10',
    youtubeId: 'n0FhUQBZiIs',
    title: 'Managing Anger the Prophetic Way',
    source: 'Mufti Menk',
    category: 'discipline',
    description: 'The strong person is not the one who overpowers others, but the one who controls himself when angry.',
    duration: '2:22',
  },
  {
    id: 'v11',
    youtubeId: 'XZpAGz5MRPU',
    title: 'Marriage: A Sign of Allah',
    source: 'Omar Suleiman',
    category: 'family',
    description: 'Allah placed love and mercy between spouses. A short reminder on nurturing that divine sign every day.',
    duration: '3:15',
  },
  {
    id: 'v12',
    youtubeId: 'R4pqtOKFLaA',
    title: 'Why We Work Hard',
    source: 'Yasir Qadhi',
    category: 'income',
    description: 'Work becomes worship with the right intention. A short reminder on the niyyah behind our daily effort.',
    duration: '2:30',
  },
];
