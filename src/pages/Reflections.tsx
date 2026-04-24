import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';

export function Reflections() {
  const navigate = useNavigate();
  const { reflections, deleteReflection } = useApp();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="flex flex-col min-h-screen bg-warm-50"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-2xl font-bold text-forest-900">Reflections</h1>
        <p className="text-stone-400 text-sm mt-1">
          {reflections.length === 0
            ? 'Your journal is empty'
            : `${reflections.length} note${reflections.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        {reflections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a8a29e"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <p className="text-stone-400 text-sm">Write what moves you to act</p>
            <button
              onClick={() => navigate('/feed')}
              className="text-forest-700 text-sm font-semibold"
            >
              Start watching →
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-3">
            {reflections.map(ref => (
              <div key={ref.id} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[11px] text-stone-400 font-medium">{formatDate(ref.createdAt)}</p>
                    {ref.videoTitle !== 'Session reflection' && (
                      <p className="text-xs text-forest-700 mt-0.5 font-medium">{ref.videoTitle}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteReflection(ref.id)}
                    aria-label="Delete reflection"
                    className="text-stone-200 hover:text-red-400 transition-colors p-1 -mr-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
                <p className="text-stone-700 text-sm leading-relaxed">{ref.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
