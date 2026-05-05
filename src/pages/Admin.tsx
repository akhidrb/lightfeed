import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, CategoryId, getCategoryById } from '../data/categories';
import { videoService } from '../services/videoService';
import { Video } from '../data/videos';

function extractYouTubeId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.trim().match(p);
    if (m) return m[1];
  }
  return null;
}

const EMPTY = {
  youtubeId: '',
  title: '',
  source: '',
  category: 'spiritual' as CategoryId,
  description: '',
  duration: '',
  language: 'en' as 'en' | 'ar',
};

export function Admin() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading } = useAuth();

  const [form, setForm]         = useState(EMPTY);
  const [urlInput, setUrlInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const [videos, setVideos]       = useState<Video[]>([]);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    const all = await videoService.getAll();
    setVideos(all);
  }, []);

  useEffect(() => { if (isAdmin) loadVideos(); }, [isAdmin, loadVideos]);

  const handleDelete = async (video: Video) => {
    if (!supabase) return;
    if (!confirm(`Delete "${video.title}"?`)) return;
    setDeleting(video.id);
    await supabase.from('videos').delete().eq('id', video.id);
    setDeleting(null);
    loadVideos();
  };

  const set = (key: keyof typeof EMPTY, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  // Auth guard
  if (loading || (user && !profile)) return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-stone-200 border-t-forest-700 rounded-full animate-spin" />
    </div>
  );
  if (!user) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-stone-500 text-sm">Sign in to access this page.</p>
        <button
          onClick={() => navigate('/auth', { state: { from: '/admin' } })}
          className="px-6 py-3 bg-forest-900 text-white text-sm font-semibold rounded-xl"
        >
          Sign in
        </button>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="text-4xl">🔒</span>
        <p className="text-stone-500 text-sm">Admin access only.</p>
        <button onClick={() => navigate('/feed')} className="text-forest-700 text-sm font-semibold">
          Go to feed →
        </button>
      </div>
    );
  }

  const handleUrlChange = async (raw: string) => {
    setUrlInput(raw);
    setError('');
    const id = extractYouTubeId(raw);
    if (!id) return;
    set('youtubeId', id);
    setFetching(true);
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
      if (res.ok) {
        const data = await res.json() as { title: string; author_name: string };
        setForm(f => ({ ...f, youtubeId: id, title: data.title, source: data.author_name }));
      } else {
        setForm(f => ({ ...f, youtubeId: id }));
      }
    } catch {
      setForm(f => ({ ...f, youtubeId: id }));
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!form.youtubeId) { setError('Paste a YouTube URL or ID first.'); return; }
    if (!form.title)     { setError('Title is required.'); return; }
    if (!form.duration)  { setError('Duration is required (e.g. 2:30).'); return; }
    if (!supabase)       { setError('Supabase not configured.'); return; }

    setSaving(true);
    setError('');
    setSuccess('');

    const { error: dbErr } = await supabase.from('videos').upsert({
      youtube_id:  form.youtubeId,
      title:       form.title,
      source:      form.source,
      category:    form.category,
      description: form.description,
      duration:    form.duration,
      language:    form.language,
    }, { onConflict: 'youtube_id', ignoreDuplicates: false });

    setSaving(false);
    if (dbErr) {
      setError(dbErr.message);
    } else {
      setSuccess(`"${form.title}" added.`);
      setForm(EMPTY);
      setUrlInput('');
      loadVideos();
    }
  };

  const thumbnail  = form.youtubeId ? videoService.getThumbnailUrl(form.youtubeId) : null;
  const categories = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <div className="min-h-screen bg-warm-50 pb-12" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-stone-100 bg-white flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-stone-400 -ml-1 p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-forest-900">Add Video</h1>
          <p className="text-stone-400 text-xs mt-0.5">
            Signed in as <span className="font-semibold text-forest-700">{profile?.username}</span>
          </p>
        </div>
      </div>

      <div className="px-5 pt-6 max-w-lg mx-auto space-y-5">
        {/* YouTube URL */}
        <div>
          <label className="label">YouTube URL or Video ID</label>
          <input
            type="text"
            value={urlInput}
            onChange={e => handleUrlChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
            className="input"
          />
          {fetching && <p className="text-xs text-stone-400 mt-1">Fetching details…</p>}
        </div>

        {/* Thumbnail */}
        {thumbnail && (
          <div className="rounded-xl overflow-hidden border border-stone-100 shadow-sm">
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <img src={thumbnail} alt="thumbnail" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="label">Title</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Video title" className="input" />
        </div>

        {/* Source */}
        <div>
          <label className="label">Source / Channel</label>
          <input type="text" value={form.source} onChange={e => set('source', e.target.value)}
            placeholder="e.g. Mufti Menk, BBC Earth" className="input" />
        </div>

        {/* Category + Duration */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input">
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div className="w-28">
            <label className="label">Duration</label>
            <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)}
              placeholder="2:30" className="input" />
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="label">Language</label>
          <div className="flex gap-2">
            {(['en', 'ar'] as const).map(lang => (
              <button key={lang} onClick={() => set('language', lang)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  form.language === lang
                    ? 'bg-forest-900 text-white border-forest-900'
                    : 'bg-white text-stone-600 border-stone-200'
                }`}>
                {lang === 'en' ? 'English' : 'العربية'}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description <span className="text-stone-400 font-normal">(optional)</span></label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="What will the viewer benefit from?" rows={3} className="input resize-none" />
        </div>

        {error   && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-forest-700 text-sm font-medium">✓ {success}</p>}

        <button onClick={handleSave} disabled={saving || !form.youtubeId}
          className="w-full py-3.5 bg-forest-900 text-white font-semibold rounded-xl text-sm disabled:opacity-40">
          {saving ? 'Saving…' : 'Add to Feed'}
        </button>

        {/* ── Video list ── */}
        {videos.length > 0 && (
          <div className="pt-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
              {videos.length} video{videos.length !== 1 ? 's' : ''} in feed
            </p>
            <div className="space-y-2">
              {videos.map(video => {
                const cat = getCategoryById(video.category);
                return (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 bg-white rounded-xl p-3 border border-stone-100 shadow-sm"
                  >
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 w-20 rounded-lg overflow-hidden bg-stone-100"
                      style={{ aspectRatio: '16/9' }}>
                      <img
                        src={videoService.getThumbnailUrl(video.youtubeId)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] px-1 rounded font-medium">
                        {video.duration}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-900 text-sm font-semibold leading-snug truncate">
                        {video.title}
                      </p>
                      <p className="text-stone-400 text-xs truncate mt-0.5">{video.source}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded-full mt-1">
                        {cat.icon} {cat.label}
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(video)}
                      disabled={deleting === video.id}
                      className="flex-shrink-0 p-2 text-stone-300 hover:text-red-400 transition-colors disabled:opacity-40"
                      aria-label="Delete video"
                    >
                      {deleting === video.id ? (
                        <div className="w-4 h-4 border-2 border-stone-200 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
