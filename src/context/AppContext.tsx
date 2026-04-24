import React, { createContext, useContext, useState, useCallback } from 'react';
import { storage, Reflection } from '../services/storageService';

const SESSION_LIMIT = 5;

interface AppContextValue {
  savedIds: string[];
  reflections: Reflection[];
  sessionCount: number;
  sessionLimitReached: boolean;
  toggleSaved: (videoId: string) => void;
  isSaved: (videoId: string) => boolean;
  addReflection: (videoId: string, videoTitle: string, text: string) => void;
  deleteReflection: (id: string) => void;
  incrementSession: () => void;
  resetSession: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds]       = useState<string[]>(() => storage.getSaved());
  const [reflections, setReflections] = useState<Reflection[]>(() => storage.getReflections());
  const [sessionCount, setSessionCount] = useState<number>(() => storage.getSessionCount());

  const sessionLimitReached = sessionCount >= SESSION_LIMIT;

  const toggleSaved = useCallback((videoId: string) => {
    storage.toggleSaved(videoId);
    setSavedIds(storage.getSaved());
  }, []);

  const isSaved = useCallback((videoId: string) => savedIds.includes(videoId), [savedIds]);

  const addReflection = useCallback((videoId: string, videoTitle: string, text: string) => {
    storage.addReflection({ videoId, videoTitle, text });
    setReflections(storage.getReflections());
  }, []);

  const deleteReflection = useCallback((id: string) => {
    storage.deleteReflection(id);
    setReflections(storage.getReflections());
  }, []);

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
