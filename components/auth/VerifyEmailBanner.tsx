import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { resendVerificationEmail } from '../../services/firebaseService';
import Spinner from '../common/Spinner';

const VerifyEmailBanner: React.FC = () => {
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
    <div className="bg-yellow-900/50 text-yellow-200 p-3 text-center text-sm sticky top-0 z-20 backdrop-blur-sm border-b border-yellow-800/50">
      <div className="container mx-auto">
        <span>
          Your email is not verified. Please check your inbox for a verification link to unlock all features.
        </span>
        <button onClick={handleResend} disabled={loading} className="font-bold underline ml-2 hover:text-yellow-100 disabled:opacity-50">
          {loading ? 'Sending...' : 'Resend Email'}
        </button>
        {message && <p className="mt-2 text-green-300">{message}</p>}
        {error && <p className="mt-2 text-red-300">{error}</p>}
      </div>
    </div>
  );
};

export default VerifyEmailBanner;