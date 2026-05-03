import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function FeedIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#1A4731' : '#a8a29e'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="7" height="18" rx="1.5" />
      <rect x="15" y="3" width="7" height="10" rx="1.5" />
      <rect x="15" y="17" width="7" height="4" rx="1.5" />
    </svg>
  );
}

function BookmarkIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={active ? '#1A4731' : 'none'}
      stroke={active ? '#1A4731' : '#a8a29e'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PenIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#1A4731' : '#a8a29e'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function PersonIcon({ active, hasUser }: { active: boolean; hasUser: boolean }) {
  return (
    <div className="relative">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#1A4731' : '#a8a29e'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      {hasUser && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-forest-500 rounded-full border border-warm-50" />
      )}
    </div>
  );
}

export function BottomNav() {
  const { user } = useAuth();

  const NAV = [
    { path: '/feed',        label: 'Feed',        icon: (a: boolean) => <FeedIcon active={a} /> },
    { path: '/saved',       label: 'Saved',       icon: (a: boolean) => <BookmarkIcon active={a} /> },
    { path: '/reflections', label: 'Reflections', icon: (a: boolean) => <PenIcon active={a} /> },
    { path: '/profile',     label: 'Profile',     icon: (a: boolean) => <PersonIcon active={a} hasUser={!!user} /> },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-14">
        {NAV.map(({ path, label, icon }) => (
          <NavLink key={path} to={path} className="flex flex-col items-center gap-0.5 px-6 py-1.5">
            {({ isActive }) => (
              <>
                {icon(isActive)}
                <span className={`text-[11px] font-medium ${isActive ? 'text-forest-900' : 'text-stone-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
