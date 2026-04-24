import React, { useState } from 'react';
import { Video } from '../data/videos';
import { getCategoryById } from '../data/categories';
import { videoService } from '../services/videoService';
import { useApp } from '../context/AppContext';
import { ReflectionModal } from './ReflectionModal';

interface VideoCardProps {
  video: Video;
  onPlay: () => void;
}

export function VideoCard({ video, onPlay }: VideoCardProps) {
  const { isSaved, toggleSaved } = useApp();
  const [playing, setPlaying]           = useState(false);
  const [played, setPlayed]             = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const saved    = isSaved(video.youtubeId);
  const category = getCategoryById(video.category);

  const handlePlay = () => {
    setPlaying(true);
    if (!played) {
      setPlayed(true);
      onPlay();
    }
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Video player */}
        <div className="relative bg-stone-900 flex-shrink-0" style={{ paddingBottom: '56.25%' }}>
          {playing ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={videoService.getEmbedUrl(video.youtubeId)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <div className="absolute inset-0 cursor-pointer group" onClick={handlePlay}>
              <img
                src={videoService.getThumbnailUrl(video.youtubeId)}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-forest-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Duration */}
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                {video.duration}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Category badge */}
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-full w-fit mb-3">
            {category.icon} {category.label}
          </span>

          {/* Title */}
          <h2 className="text-[18px] font-bold text-stone-900 leading-snug mb-1">
            {video.title}
          </h2>

          {/* Source */}
          <p className="text-sm text-stone-400 font-medium mb-3">{video.source}</p>

          {/* Description */}
          <p className="text-sm text-stone-600 leading-relaxed flex-1">
            {video.description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
            <button
              onClick={() => setShowReflection(true)}
              className="flex items-center gap-2 text-sm text-stone-500 hover:text-forest-900 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Reflect
            </button>

            <button
              onClick={() => toggleSaved(video.youtubeId)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors
                ${saved ? 'text-forest-900' : 'text-stone-400 hover:text-forest-900'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {showReflection && (
        <ReflectionModal
          videoId={video.id}
          videoTitle={video.title}
          onClose={() => setShowReflection(false)}
        />
      )}
    </>
  );
}
