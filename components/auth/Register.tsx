import React, { useState } from 'react';
import { signUpWithEmail } from '../../services/firebaseService';
import Spinner from '../common/Spinner';

interface RegisterProps {
  onToggle: () => void;
}

const Register: React.FC<RegisterProps> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUpWithEmail(email, password, displayName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create an account.');
    }
    setLoading(false);
  };

  if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[--color-base] p-4">
          <div className="w-full max-w-md bg-[--color-surface] p-8 rounded-2xl shadow-2xl border border-[--color-border] text-center">
             <h1 className="text-2xl font-bold text-green-400 mb-4">Registration Successful!</h1>
             <p className="text-[--color-text-secondary]">
                We've sent a verification link to <strong className="text-[--color-text-primary]">{email}</strong>.
             </p>
             <p className="text-[--color-text-secondary] mt-2">
                Please check your inbox to continue.
             </p>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-base] p-4">
      <div className="w-full max-w-md bg-[--color-surface] p-8 rounded-2xl shadow-2xl border border-[--color-border]">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] mb-2">
          Create Your Account
        </h1>
        <p className="text-center text-[--color-text-secondary] mb-8">Join the Future of Hair Color</p>
        
        {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
           <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full bg-black/20 border border-[--color-border] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[--color-accent-pink]"
          />
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
            placeholder="Password (6+ characters)"
            required
            className="w-full bg-black/20 border border-[--color-border] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[--color-accent-pink]"
          />
           <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            className="w-full bg-black/20 border border-[--color-border] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[--color-accent-pink]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] text-white font-bold py-3 rounded-md disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Spinner /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-[--color-text-secondary] mt-8">
          Already have an account?{' '}
          <button onClick={onToggle} className="font-semibold text-[--color-accent-pink] hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;