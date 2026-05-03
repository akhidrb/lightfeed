import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../data/videos';
import { videoService } from '../services/videoService';
import { useApp } from '../context/AppContext';
import { VideoCard } from '../components/VideoCard';
import { BottomNav } from '../components/BottomNav';

const HEADER_H = 56;
const NAV_H    = 56;

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-400">
      <div className="w-8 h-8 border-2 border-stone-200 border-t-forest-700 rounded-full animate-spin" />
      <p className="text-sm">Loading…</p>
    </div>
  );
}

export function Feed() {
  const navigate = useNavigate();
  const { sessionLimitReached, incrementSession } = useApp();

  const [videos, setVideos]       = useState<Video[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    videoService.getAll()
      .then(v => { setVideos(v); setActiveIdx(0); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (sessionLimitReached) navigate('/session-done');
  }, [sessionLimitReached, navigate]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const h = scrollRef.current.clientHeight;
    if (h === 0) return;
    setActiveIdx(Math.round(scrollRef.current.scrollTop / h));
  }, []);

  const cardStyle = { height: `calc(100dvh - ${HEADER_H}px - ${NAV_H}px)` };

  return (
    <div className="flex flex-col bg-warm-50" style={{ height: '100dvh' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 bg-warm-50 z-40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center px-5 h-14">
          <span className="text-[17px] font-bold text-forest-900 tracking-tight">✦ LightFeed</span>
          {!loading && videos.length > 0 && (
            <span className="ml-auto text-xs text-stone-400 font-medium tabular-nums">
              {activeIdx + 1} / {videos.length}
            </span>
          )}
        </div>
      </div>

      {/* Feed */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="feed-scroll overflow-y-scroll scrollbar-hide flex-1"
        style={cardStyle}
      >
        {loading ? (
          <div style={cardStyle}><Spinner /></div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-400">
            <span className="text-4xl">🌿</span>
            <p className="text-sm">No videos yet</p>
          </div>
        ) : (
          videos.map((video, idx) => (
            <div key={video.id} className="feed-item" style={cardStyle}>
              <VideoCard
                video={video}
                onPlay={() => { setActiveIdx(idx); incrementSession(); }}
              />
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
