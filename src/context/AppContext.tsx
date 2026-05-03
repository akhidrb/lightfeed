import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { storage, Reflection } from '../services/storageService';
import { supabase } from '../lib/supabase';

const SESSION_LIMIT = 5;

interface AppContextValue {
  savedIds: string[];
  reflections: Reflection[];
  sessionCount: number;
  sessionLimitReached: boolean;
  toggleSaved: (youtubeId: string) => void;
  isSaved: (youtubeId: string) => boolean;
  addReflection: (videoId: string, videoTitle: string, text: string) => void;
  deleteReflection: (id: string) => void;
  incrementSession: () => void;
  resetSession: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function loadSavedFromDb(userId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('saved_videos')
    .select('youtube_id')
    .eq('user_id', userId);
  return (data ?? []).map((r: { youtube_id: string }) => r.youtube_id);
}

async function loadReflectionsFromDb(userId: string): Promise<Reflection[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data ?? []).map((r: Record<string, string>) => ({
    id:         r.id,
    videoId:    r.youtube_id ?? '',
    videoTitle: r.video_title ?? '',
    text:       r.text,
    createdAt:  r.created_at,
  }));
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds]       = useState<string[]>(() => storage.getSaved());
  const [reflections, setReflections] = useState<Reflection[]>(() => storage.getReflections());
  const [sessionCount, setSessionCount] = useState<number>(() => storage.getSessionCount());
  const [userId, setUserId]           = useState<string | null>(null);

  const sessionLimitReached = sessionCount >= SESSION_LIMIT;

  // Sync state when auth changes
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const uid = session.user.id;
        setUserId(uid);
        setSavedIds(await loadSavedFromDb(uid));
        setReflections(await loadReflectionsFromDb(uid));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const uid = session.user.id;
        setUserId(uid);
        setSavedIds(await loadSavedFromDb(uid));
        setReflections(await loadReflectionsFromDb(uid));
      } else {
        setUserId(null);
        setSavedIds(storage.getSaved());
        setReflections(storage.getReflections());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleSaved = useCallback(async (youtubeId: string) => {
    const isCurrentlySaved = savedIds.includes(youtubeId);

    if (userId && supabase) {
      if (isCurrentlySaved) {
        await supabase.from('saved_videos').delete()
          .eq('user_id', userId).eq('youtube_id', youtubeId);
      } else {
        await supabase.from('saved_videos').insert({ user_id: userId, youtube_id: youtubeId });
      }
      setSavedIds(await loadSavedFromDb(userId));
    } else {
      storage.toggleSaved(youtubeId);
      setSavedIds(storage.getSaved());
    }
  }, [savedIds, userId]);

  const isSaved = useCallback((youtubeId: string) => savedIds.includes(youtubeId), [savedIds]);

  const addReflection = useCallback(async (videoId: string, videoTitle: string, text: string) => {
    if (userId && supabase) {
      await supabase.from('reflections').insert({
        user_id:     userId,
        youtube_id:  videoId,
        video_title: videoTitle,
        text,
      });
      setReflections(await loadReflectionsFromDb(userId));
    } else {
      storage.addReflection({ videoId, videoTitle, text });
      setReflections(storage.getReflections());
    }
  }, [userId]);

  const deleteReflection = useCallback(async (id: string) => {
    if (userId && supabase) {
      await supabase.from('reflections').delete().eq('id', id).eq('user_id', userId);
      setReflections(await loadReflectionsFromDb(userId));
    } else {
      storage.deleteReflection(id);
      setReflections(storage.getReflections());
    }
  }, [userId]);

  const incrementSession = useCallback(() => {
    const next = storage.incrementSessionCount();
    setSessionCount(next);
  }, []);

  const resetSession = useCallback(() => {
    storage.resetSessionCount();
    setSessionCount(0);
  }, []);

  return (
    <AppContext.Provider value={{
      savedIds, reflections, sessionCount, sessionLimitReached,
      toggleSaved, isSaved, addReflection, deleteReflection,
      incrementSession, resetSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
