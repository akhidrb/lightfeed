import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';

export function Profile() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const { reflections, savedIds } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-200 border-t-forest-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen bg-warm-50 flex flex-col items-center justify-center gap-4 px-8 text-center"
        style={{ paddingBottom: '80px' }}
      >
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a8a29e"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <p className="text-stone-500 text-sm">Sign in to save videos and reflections to your account</p>
        <button
          onClick={() => navigate('/auth', { state: { from: '/profile' } })}
          className="px-6 py-3 bg-forest-900 text-white text-sm font-semibold rounded-xl"
        >
          Sign in / Create account
        </button>
        <BottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-200 border-t-forest-700 rounded-full animate-spin" />
      </div>
    );
  }


  return (
    <div
      className="flex flex-col min-h-screen bg-warm-50"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-forest-900">Profile</h1>
      </div>

      <div className="px-4 space-y-3 pb-28">
        {/* User card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-forest-50 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-forest-700">
                {profile.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-stone-900 text-lg">{profile.username}</p>
              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full mt-0.5 ${
                isAdmin
                  ? 'bg-gold-100 text-gold-700'
                  : 'bg-forest-50 text-forest-700'
              }`}>
                {isAdmin ? '⚡ Admin' : '✦ Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 text-center">
            <p className="text-2xl font-bold text-forest-900">{savedIds.length}</p>
            <p className="text-xs text-stone-400 mt-0.5">Saved videos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 text-center">
            <p className="text-2xl font-bold text-forest-900">{reflections.length}</p>
            <p className="text-xs text-stone-400 mt-0.5">Reflections</p>
          </div>
        </div>

        {/* Admin shortcut */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center justify-between"
          >
            <span className="text-sm font-semibold text-stone-800">Add videos</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a29e"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Sign out */}
        <button
          onClick={async () => { await signOut(); navigate('/feed'); }}
          className="w-full py-3.5 bg-white rounded-2xl border border-stone-200 text-stone-600 text-sm font-medium shadow-sm"
        >
          Sign out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
