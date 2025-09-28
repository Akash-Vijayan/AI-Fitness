import { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '../types';

// Remove undefined fields to avoid Firestore errors
function cleanData<T extends Record<string, any>>(data: T): Partial<T> {
  const result: Partial<T> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== '') result[key as keyof T] = value;
  });
  return result;
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            name: '',
            age: null,
            gender: '',
            height: null,
            weight: null,
            fitness_goal: '',
            activity_level: ''
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    return { error: null };
  };

  const signUpProfile = async (profileData: UserProfile) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const cleanProfile = cleanData(profileData);
    await setDoc(docRef, cleanProfile, { merge: true });
    setProfile(cleanProfile as UserProfile);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const cleanUpdates = cleanData(updates);
    await setDoc(docRef, cleanUpdates, { merge: true });
    setProfile(prev => ({ ...prev!, ...cleanUpdates } as UserProfile));
  };

  return { user, profile, loading, signUp, signIn, signOut, signUpProfile, updateProfile };
}
