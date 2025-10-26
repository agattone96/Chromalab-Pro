// FIX: Use scoped firebase packages to resolve module export errors.
import { initializeApp } from '@firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider, // Import OAuthProvider for Apple
  signOut,
  updateProfile,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendEmailVerification,
} from '@firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    serverTimestamp,
    updateDoc
} from '@firebase/firestore';
import type { User } from '@firebase/auth';
import type { AppUser } from '../types';

const firebaseConfig = {
  // FIX: Use the primary API_KEY from the environment for Firebase services.
  apiKey: process.env.API_KEY,
  authDomain: `${process.env.PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.PROJECT_ID,
  storageBucket: `${process.env.PROJECT_ID}.appspot.com`,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Note on Session Management:
 * The Firebase Web SDK (v9+) uses IndexedDB for session persistence (`indexedDBLocalPersistence`).
 * This is a secure, client-side mechanism that automatically manages user tokens.
 * It's the standard for single-page applications (SPAs) and avoids the complexities
 * of managing HttpOnly cookies, which would require a dedicated backend server to set.
 */

// --- User Document Management ---
export const createUserDocument = async (userAuth: User, additionalData = {}) => {  
  const userDocRef = doc(db, 'users', userAuth.uid);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    const { email, displayName } = userAuth;
    const createdAt = serverTimestamp();
    try {
      const newUser: Omit<AppUser, 'createdAt'> & {createdAt: any} = {
        uid: userAuth.uid,
        email,
        displayName,
        role: 'Stylist',
        isVerified: false,
        createdAt,
        ...additionalData
      };
      await setDoc(userDocRef, newUser);
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  }
  return userDocRef;
};

export const getUserDocument = async (uid: string): Promise<AppUser | null> => {
    const userDocRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        // Convert Firestore Timestamp to JS Date
        return { ...data, createdAt: data.createdAt.toDate() } as AppUser;
    }
    return null;
}

export const updateUserLicense = async (uid: string, licenseUrl: string, isVerified: boolean = false) => {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { licenseUrl, isVerified });
}

// --- Auth State Listener ---
export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- Email & Password ---
export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<User> => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(user);
  await updateProfile(user, { displayName });
  await createUserDocument(user, { displayName });
  return user;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

export const resendVerificationEmail = async (): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
        await sendEmailVerification(user);
    } else {
        throw new Error("No user is currently signed in.");
    }
};

// --- Google OAuth ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async (): Promise<User> => {
  const { user } = await signInWithPopup(auth, googleProvider);
  await createUserDocument(user);
  return user;
};

// --- Apple OAuth ---
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export const signInWithApple = async (): Promise<User> => {
    const { user } = await signInWithPopup(auth, appleProvider);
    await createUserDocument(user);
    return user;
};

// --- Magic Link ---
const actionCodeSettings = {
  url: window.location.href,
  handleCodeInApp: true,
};

export const sendMagicLink = async (email: string) => {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
};

export const handleMagicLinkSignIn = async (): Promise<User | null> => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
            const { user } = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            await createUserDocument(user);
            return user;
        }
    }
    return null;
}


// --- Sign Out ---
export const signOutUser = (): Promise<void> => signOut(auth);