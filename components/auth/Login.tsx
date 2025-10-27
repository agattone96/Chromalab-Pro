import React, { useState } from 'react';
import { signInWithEmail, signInWithGoogle, sendMagicLink, signInWithApple } from '../../services/firebaseService';
import Spinner from '../common/Spinner';

interface LoginProps {
  onToggle: () => void;
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggle, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email to receive a magic link.');
      return;
    }
    setLoading(true);
    setError('');
    setMagicLinkSent(false);
    try {
      await sendMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link.');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      // Don't show an error if the user closes the popup
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to sign in with Google.');
      }
    }
    setLoading(false);
  };
  
  const handleAppleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithApple();
      onSuccess();
    } catch (err: any) {
       // Don't show an error if the user closes the popup
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Failed to sign in with Apple.');
      }
    }
    setLoading(false);
  };

  return (
    <div>
      {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
      {magicLinkSent && <p className="bg-green-900/50 text-green-300 p-3 rounded-md mb-4 text-sm">Check your inbox! A magic link has been sent to {email}.</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
          className="w-full bg-black/20 border border-[--color-border] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[--color-accent-pink]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full bg-black/20 border border-[--color-border] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[--color-accent-pink]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] text-white font-bold py-3 rounded-md disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Spinner /> : 'Sign In'}
        </button>
      </form>

      <div className="flex items-center justify-between my-4">
          <hr className="w-full border-t border-[--color-border]" />
          <span className="px-2 text-xs text-[--color-text-secondary]">OR</span>
          <hr className="w-full border-t border-[--color-border]" />
      </div>

      <div className="space-y-4">
            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full bg-black/20 border border-[--color-border] text-white font-bold py-3 rounded-md hover:bg-[--color-border] transition-colors disabled:opacity-50"
            >
              Sign in with Magic Link
          </button>
          <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-black/20 border border-[--color-border] text-white font-bold py-3 rounded-md hover:bg-[--color-border] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/> Sign in with Google
          </button>
          <button
              onClick={handleAppleSignIn}
              disabled={loading}
              className="w-full bg-black/20 border border-[--color-border] text-white font-bold py-3 rounded-md hover:bg-[--color-border] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.28,6.958c0.012-0.038,0.143-0.493,0.479-0.916c0.354-0.44,0.852-0.801,1.432-0.801 c0.018,0,0.036,0.002,0.054,0.004c-0.569,0.596-0.923,1.405-0.923,2.22c0,0.867,0.399,1.697,1.01,2.298 c-0.522,0.303-1.114,0.473-1.748,0.473c-0.787,0-1.504-0.34-2.028-0.938c-0.542-0.62-0.853-1.483-0.853-2.348 C5.698,7.743,6.583,6.958,8.28,6.958z"/>
                <path d="M10.16,4.346c0.438-0.482,0.84-1.133,0.961-1.838c-0.672,0.033-1.343,0.32-1.895,0.762 c-0.45,0.365-0.933,0.94-1.22,1.524c-0.56,1.149-0.453,2.578,0.316,3.588c0.504,0.66,1.213,1.048,1.938,1.048 c0.75,0,1.494-0.41,1.988-1.127c-0.038-0.016-0.352-0.164-0.738-0.342c-0.395-0.183-0.766-0.344-0.766-0.344 s-0.15-0.072-0.342-0.193c-0.185-0.117-0.363-0.24-0.525-0.375c-0.318-0.264-0.492-0.588-0.492-0.918 c0-0.379,0.211-0.74,0.615-0.998c0.334-0.215,0.738-0.348,1.152-0.348c0.121,0,0.24,0.01,0.358,0.029 C12.871,5.65,11.2,4.346,10.16,4.346z"/>
                <path d="M14.02,2.464C12.33,2.51,11.023,3.75,11.023,3.75s-1.135,1.254-1.135,2.94c0,1.868,1.365,2.758,2.613,2.758 c1.186,0,1.93-0.676,1.93-0.676s0.992-0.867,1.035-2.518C15.498,4.33,15.195,2.43,14.02,2.464z"/>
              </svg>
              Sign in with Apple
          </button>
      </div>

      <p className="text-center text-sm text-[--color-text-secondary] mt-8">
        Don't have an account?{' '}
        <button onClick={onToggle} className="font-semibold text-[--color-accent-pink] hover:underline">
          Register now
        </button>
      </p>
    </div>
  );
};

export default Login;