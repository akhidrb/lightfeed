import React from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storageService';

export function Welcome() {
  const navigate = useNavigate();

  const handleBegin = () => {
    storage.markVisited();
    navigate('/feed');
  };

  return (
    <div
      className="min-h-screen bg-forest-900 flex flex-col items-center justify-center p-8 text-center"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Logo mark */}
      <div className="mb-10">
        <div className="w-18 h-18 bg-gold-500 rounded-[22px] flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ width: 72, height: 72 }}>
          <span className="text-4xl text-forest-950">✦</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">LightFeed</h1>
        <p className="text-forest-200 mt-2 text-base">Short reminders. Lasting benefit.</p>
      </div>

      {/* Value props */}
      <div className="max-w-sm w-full space-y-3 mb-12">
        {[
          { icon: '📖', text: "Curated reminders from the Qur'an, Sunnah, and trusted scholars." },
          { icon: '🌿', text: 'After a few videos, we gently ask you to pause and reflect — not scroll without end.' },
          { icon: '✍️', text: 'Save what moves you. Write what you want to act on.' },
        ].map(({ icon, text }) => (
          <div key={text} className="bg-white/10 rounded-2xl px-5 py-4 text-left flex gap-3 items-start">
            <span className="text-xl mt-0.5">{icon}</span>
            <p className="text-white/85 text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={handleBegin}
        className="w-full max-w-xs py-4 bg-gold-500 text-forest-950 font-bold text-base rounded-2xl shadow-lg hover:bg-gold-300 transition-colors"
      >
        Begin
      </button>
      <p className="text-forest-300 text-xs mt-4">No account · No tracking · No noise</p>
    </div>
  );
}
