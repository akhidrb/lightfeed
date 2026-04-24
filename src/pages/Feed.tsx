import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryId } from '../data/categories';
import { Video } from '../data/videos';
import { videoService } from '../services/videoService';
import { useApp } from '../context/AppContext';
import { TopicFilter } from '../components/TopicFilter';
import { VideoCard } from '../components/VideoCard';
import { BottomNav } from '../components/BottomNav';

const HEADER_H = 112; // px: title row (48) + topic filter (56) + small padding
const NAV_H    = 56;  // px: bottom nav

export function Feed() {
  const navigate = useNavigate();
  const { sessionLimitReached, incrementSession } = useApp();

  const [category, setCategory] = useState<CategoryId>('all');
  const [videos, setVideos]     = useState<Video[]>(() => videoService.getAll());
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter by category and reset scroll
  useEffect(() => {
    setVideos(videoService.getByCategory(category));
    setActiveIdx(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [category]);

  // Navigate to pause screen when session limit hit
  useEffect(() => {
    if (sessionLimitReached) navigate('/session-done');
  }, [sessionLimitReached, navigate]);

  // Track which card is in view via scroll position
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const cardH = scrollRef.current.clientHeight;
    if (cardH === 0) return;
    const idx = Math.round(scrollRef.current.scrollTop / cardH);
    setActiveIdx(idx);
  }, []);

  const cardStyle = {
    height: `calc(100dvh - ${HEADER_H}px - ${NAV_H}px)`,
  };

  return (
    <div className="flex flex-col bg-warm-50" style={{ height: '100dvh' }}>
      {/* Fixed header */}
      <div
        className="flex-shrink-0 bg-warm-50 z-40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center px-5 py-3">
          <span className="text-[17px] font-bold text-forest-900 tracking-tight">✦ LightFeed</span>
          <span className="ml-auto text-xs text-stone-400 font-medium tabular-nums">
            {videos.length > 0 ? `${activeIdx + 1} / ${videos.length}` : ''}
          </span>
        </div>
        <TopicFilter selected={category} onChange={setCategory} />
      </div>

      {/* Scroll feed */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="feed-scroll overflow-y-scroll scrollbar-hide flex-1"
        style={cardStyle}
      >
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-400">
            <span className="text-4xl">🌿</span>
            <p className="text-sm">No videos in this category yet</p>
          </div>
        ) : (
          videos.map((video, idx) => (
            <div key={video.id} className="feed-item" style={cardStyle}>
              <VideoCard
                video={video}
                onPlay={() => {
                  setActiveIdx(idx);
                  incrementSession();
                }}
              />
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
