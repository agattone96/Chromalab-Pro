import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';
import Register from './Register';
import GlobalSpinner from '../common/GlobalSpinner';
import VerifyEmail from './VerifyEmail';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { firebaseUser, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  if (loading) {
    return <GlobalSpinner />;
  }

  if (!firebaseUser) {
    return isRegistering ? (
      <Register onToggle={() => setIsRegistering(false)} />
    ) : (
      <Login onToggle={() => setIsRegistering(true)} />
    );
  }

  if (!firebaseUser.emailVerified) {
    return <VerifyEmail />;
  }

  return <>{children}</>;
};

export default AuthGate;