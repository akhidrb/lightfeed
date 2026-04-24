import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface ReflectionModalProps {
  videoId: string;
  videoTitle: string;
  onClose: () => void;
}

export function ReflectionModal({ videoId, videoTitle, onClose }: ReflectionModalProps) {
  const { addReflection } = useApp();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    addReflection(videoId, videoTitle, text.trim());
    setSaved(true);
    setTimeout(onClose, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-2xl p-6 shadow-2xl animate-slide-up"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />

        {saved ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-3">🌿</div>
            <p className="text-forest-900 font-semibold">Reflection saved</p>
            <p className="text-stone-400 text-sm mt-1">May it benefit you</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-stone-400 font-semibold uppercase tracking-widest mb-1">
              Your reflection
            </p>
            {videoTitle !== 'Session reflection' && (
              <p className="text-stone-600 text-sm mb-4 line-clamp-1">{videoTitle}</p>
            )}

            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What is one thing you want to act on from this reminder?"
              rows={4}
              className="w-full p-3.5 rounded-xl border border-stone-200 text-stone-800 text-sm
                         resize-none focus:outline-none focus:ring-2 focus:ring-forest-200
                         placeholder-stone-400 leading-relaxed"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-500 text-sm font-medium"
              >
                Skip
              </button>
              <button
                onClick={handleSave}
                disabled={!text.trim()}
                className="flex-1 py-3 rounded-xl bg-forest-900 text-white text-sm font-semibold
                           disabled:opacity-40 transition-opacity"
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
