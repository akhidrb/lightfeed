import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ReflectionModal } from '../components/ReflectionModal';

const PROMPTS = [
  'What is one thing you want to act on today?',
  'Which reminder touched your heart most?',
  'How can you apply what you heard in the next hour?',
  'Who can you share a benefit with right now?',
  'What will you do differently after this session?',
];

export function SessionDone() {
  const navigate = useNavigate();
  const { resetSession } = useApp();
  const [showReflection, setShowReflection] = useState(false);
  const prompt = useMemo(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)], []);

  const handleContinue = () => {
    resetSession();
    navigate('/feed');
  };

  return (
    <>
      <div
        className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-8 py-12 text-center"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Icon */}
        <div className="w-20 h-20 bg-forest-50 rounded-full flex items-center justify-center mb-8">
          <span className="text-4xl">🌿</span>
        </div>

        <h2 className="text-2xl font-bold text-forest-900 mb-3">Pause for a moment</h2>
        <p className="text-stone-500 text-[15px] leading-relaxed max-w-[280px] mb-10">
          You've watched several reminders. Rather than scrolling further, take a breath.
        </p>

        {/* Reflection prompt card */}
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-sm border border-stone-100 mb-8 text-left">
          <p className="text-[11px] text-stone-400 font-semibold uppercase tracking-widest mb-3">
            Consider this
          </p>
          <p className="text-stone-700 font-medium leading-relaxed text-[15px]">{prompt}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => setShowReflection(true)}
            className="py-3.5 bg-forest-900 text-white font-semibold rounded-xl text-sm"
          >
            Write a reflection
          </button>
          <button
            onClick={() => navigate('/saved')}
            className="py-3.5 bg-white text-forest-900 font-medium rounded-xl text-sm border border-stone-200"
          >
            Review saved videos
          </button>
          <button
            onClick={handleContinue}
            className="py-3 text-stone-400 text-sm hover:text-stone-600 transition-colors"
          >
            Continue watching
          </button>
        </div>
      </div>

      {showReflection && (
        <ReflectionModal
          videoId="session"
          videoTitle="Session reflection"
          onClose={() => {
            setShowReflection(false);
            navigate('/reflections');
          }}
        />
      )}
    </>
  );
}
