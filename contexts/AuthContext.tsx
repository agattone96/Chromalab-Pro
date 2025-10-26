import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChangedListener, getUserDocument, handleMagicLinkSignIn } from '../services/firebaseService';
// FIX: The User type should be imported from the scoped package '@firebase/auth'.
import type { User } from '@firebase/auth';
import type { AppUser } from '../types';

interface AuthContextType {
  currentUser: AppUser | null; // Firestore data
  firebaseUser: User | null; // Firebase Auth user
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to sign in with magic link on initial app load.
    // This will do nothing if the URL does not contain a magic link.
    handleMagicLinkSignIn().catch(err => {
        // This is not shown to the user. An invalid link will just mean
        // they see the login page, which is the desired behavior.
        console.error("Magic link sign in failed on load:", err);
    });

    const unsubscribe = onAuthStateChangedListener(async (user: User | null) => {
      setFirebaseUser(user);
      if (user) {
        // User is signed in, get their app-specific data from Firestore
        const appUser = await getUserDocument(user.uid);
        if (appUser) {
          setCurrentUser(appUser);
        } else {
            // This case might happen if a user exists in Auth but not Firestore
            console.error("No user document found for UID:", user.uid);
            setCurrentUser(null);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { currentUser, firebaseUser, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
