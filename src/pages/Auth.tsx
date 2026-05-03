import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PinDots({ filled }: { filled: number }) {
  return (
    <div className="flex gap-3.5 justify-center my-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
            i < filled ? 'bg-forest-900 scale-110' : 'bg-stone-200'
          }`}
        />
      ))}
    </div>
  );
}

export function Auth() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { signIn, signUp } = useAuth();

  const from = (location.state as { from?: string })?.from ?? '/feed';

  const [mode, setMode]         = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [pin, setPin]           = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setError(''); setPin(''); }, [mode]);

  const handlePinChange = (val: string) => {
    if (/^\d{0,6}$/.test(val)) setPin(val);
  };

  const handleSubmit = async () => {
    if (!username.trim())  { setError('Enter a username.'); return; }
    if (pin.length !== 6)  { setError('PIN must be 6 digits.'); return; }
    setLoading(true);
    setError('');
    const err = mode === 'signin'
      ? await signIn(username.trim(), pin)
      : await signUp(username.trim(), pin);
    setLoading(false);
    if (err) { setError(err); setPin(''); }
    else navigate(from, { replace: true });
  };

  return (
    <div
      className="min-h-screen bg-forest-900 flex flex-col items-center justify-center px-8"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-gold-500 rounded-[18px] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl text-forest-950">✦</span>
        </div>
        <h1 className="text-2xl font-bold text-white">LightFeed</h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-xs bg-white rounded-2xl p-6 shadow-xl">
        {/* Mode toggle */}
        <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
          {(['signin', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === m ? 'bg-white text-forest-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
            onKeyDown={e => e.key === 'Enter' && pinRef.current?.focus()}
            placeholder="your_username"
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900
                       text-sm focus:outline-none focus:ring-2 focus:ring-forest-200 placeholder-stone-400"
          />
        </div>

        {/* PIN */}
        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">
            6-digit PIN
          </label>
          <PinDots filled={pin.length} />
          <input
            ref={pinRef}
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={e => handlePinChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pin.length === 6 && handleSubmit()}
            placeholder="······"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900
                       text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2
                       focus:ring-forest-200 placeholder-stone-300"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || pin.length !== 6 || !username.trim()}
          className="w-full mt-5 py-3 bg-forest-900 text-white font-semibold rounded-xl
                     text-sm disabled:opacity-40 transition-opacity"
        >
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </div>

      {/* Guest */}
      <button
        onClick={() => navigate('/feed')}
        className="mt-6 text-forest-300 text-sm"
      >
        Continue as guest
      </button>
    </div>
  );
}
