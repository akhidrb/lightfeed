import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { videoService } from '../services/videoService';
import { getCategoryById } from '../data/categories';
import { Video } from '../data/videos';
import { BottomNav } from '../components/BottomNav';

export function Saved() {
  const navigate = useNavigate();
  const { savedIds, toggleSaved } = useApp();
  const [videos, setVideos]   = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (savedIds.length === 0) { setVideos([]); setLoading(false); return; }
    setLoading(true);
    videoService.getByYoutubeIds(savedIds)
      .then(setVideos)
      .finally(() => setLoading(false));
  }, [savedIds.join(',')]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col min-h-screen bg-warm-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-2xl font-bold text-forest-900">Saved</h1>
        <p className="text-stone-400 text-sm mt-1">
          {loading ? 'Loading…' : videos.length === 0
            ? 'Nothing saved yet'
            : `${videos.length} video${videos.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center pt-24">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-forest-700 rounded-full animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a8a29e"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-stone-400 text-sm">Bookmark reminders that benefit you</p>
            <button onClick={() => navigate('/feed')} className="text-forest-700 text-sm font-semibold">
              Browse feed →
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-3">
            {videos.map(video => {
              const cat = getCategoryById(video.category);
              return (
                <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
                  <div className="relative" style={{ paddingBottom: '56.25%' }}>
                    <img
                      src={videoService.getThumbnailUrl(video.youtubeId)}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                      {video.duration}
                    </span>
                    {video.language === 'ar' && (
                      <span className="absolute top-2 left-2 bg-gold-500 text-forest-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        عربي
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full mb-2">
                      {cat.icon} {cat.label}
                    </span>
                    <h3 className="font-bold text-stone-900 text-[15px] leading-snug">{video.title}</h3>
                    <p className="text-xs text-stone-400 mt-0.5 mb-3">{video.source}</p>
                    <div className="flex items-center justify-between">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-forest-700 font-semibold"
                      >
                        Watch on YouTube →
                      </a>
                      <button
                        onClick={() => toggleSaved(video.youtubeId)}
                        className="text-xs text-stone-300 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
