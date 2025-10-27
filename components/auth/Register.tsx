import React, { useState } from 'react';
import { signUpWithEmail } from '../../services/firebaseService';
import Spinner from '../common/Spinner';

interface RegisterProps {
  onToggle: () => void;
  onSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onToggle, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create an account.');
    }
    setLoading(false);
  };

  return (
    <div>
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
  );
};

export default Register;