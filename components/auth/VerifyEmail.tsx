import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { resendVerificationEmail, signOutUser } from '../../services/firebaseService';
import Spinner from '../common/Spinner';

const VerifyEmail: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await resendVerificationEmail();
      setMessage('A new verification email has been sent. Please check your inbox (and spam folder).');
    } catch (err: any) {
      setError(err.message || 'Failed to resend email. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-base] p-4">
      <div className="w-full max-w-md bg-[--color-surface] p-8 rounded-2xl shadow-2xl border border-[--color-border] text-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] mb-4">
          Verify Your Email
        </h1>
        <p className="text-[--color-text-secondary] mb-6">
          A verification link has been sent to <strong className="text-[--color-text-primary]">{firebaseUser?.email}</strong>. Please click the link to activate your account.
        </p>

        {message && <p className="bg-green-900/50 text-green-300 p-3 rounded-md mb-4 text-sm">{message}</p>}
        {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
        
        <p className="text-sm text-[--color-text-secondary] mb-6">
            After verifying, you may need to refresh this page.
        </p>

        <div className="space-y-4">
            <button
                onClick={handleResend}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] text-white font-bold py-3 rounded-md disabled:opacity-50 flex items-center justify-center"
            >
                {loading ? <Spinner /> : 'Resend Verification Email'}
            </button>
            <button
                onClick={signOutUser}
                className="w-full bg-black/20 border border-[--color-border] text-white font-bold py-3 rounded-md hover:bg-[--color-border] transition-colors"
            >
                Sign Out
            </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
