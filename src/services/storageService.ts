const KEYS = {
  SAVED_VIDEOS:   'lf_saved_videos',
  REFLECTIONS:    'lf_reflections',
  HAS_VISITED:    'lf_has_visited',
  SESSION_COUNT:  'lf_session_count',
  SESSION_DATE:   'lf_session_date',
} as const;

export interface Reflection {
  id: string;
  videoId: string;
  videoTitle: string;
  text: string;
  createdAt: string;
}

const today = () => new Date().toDateString();

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const storage = {
  // --- Saved videos ---
  getSaved: (): string[] => readJson<string[]>(KEYS.SAVED_VIDEOS, []),

  toggleSaved: (videoId: string): boolean => {
    const saved = storage.getSaved();
    const idx = saved.indexOf(videoId);
    if (idx === -1) {
      saved.push(videoId);
      localStorage.setItem(KEYS.SAVED_VIDEOS, JSON.stringify(saved));
      return true;
    }
    saved.splice(idx, 1);
    localStorage.setItem(KEYS.SAVED_VIDEOS, JSON.stringify(saved));
    return false;
  },

  // --- Reflections ---
  getReflections: (): Reflection[] => readJson<Reflection[]>(KEYS.REFLECTIONS, []),

  addReflection: (input: Omit<Reflection, 'id' | 'createdAt'>): Reflection => {
    const all = storage.getReflections();
    const reflection: Reflection = {
      ...input,
      id: `r_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    all.unshift(reflection);
    localStorage.setItem(KEYS.REFLECTIONS, JSON.stringify(all));
    return reflection;
  },

  deleteReflection: (id: string): void => {
    const filtered = storage.getReflections().filter(r => r.id !== id);
    localStorage.setItem(KEYS.REFLECTIONS, JSON.stringify(filtered));
  },

  // --- Onboarding ---
  hasVisited: (): boolean => localStorage.getItem(KEYS.HAS_VISITED) === 'true',
  markVisited: (): void => localStorage.setItem(KEYS.HAS_VISITED, 'true'),

  // --- Session counting (resets daily) ---
  getSessionCount: (): number => {
    if (localStorage.getItem(KEYS.SESSION_DATE) !== today()) {
      localStorage.setItem(KEYS.SESSION_DATE, today());
      localStorage.setItem(KEYS.SESSION_COUNT, '0');
      return 0;
    }
    return parseInt(localStorage.getItem(KEYS.SESSION_COUNT) ?? '0', 10);
  },

  incrementSessionCount: (): number => {
    const next = storage.getSessionCount() + 1;
    localStorage.setItem(KEYS.SESSION_COUNT, String(next));
    return next;
  },

  resetSessionCount: (): void => {
    localStorage.setItem(KEYS.SESSION_COUNT, '0');
    localStorage.setItem(KEYS.SESSION_DATE, today());
  },
};
