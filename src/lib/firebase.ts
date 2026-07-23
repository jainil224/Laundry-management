import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { uploadToCloudinary, fileToBase64 } from './cloudinary';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Storage
export const storage = getStorage(app);

/**
 * Upload a clothing image:
 * 1. Try Cloudinary upload if configured
 * 2. Instant client-side compressed base64 fallback (100% reliable, zero CORS/permission issues)
 */
export const uploadClothingImage = async (
  file: File,
  userId: string,
  onProgress?: (percent: number) => void
): Promise<string> => {
  onProgress?.(30);

  // 1. Try Cloudinary
  try {
    const cloudinaryUrl = await uploadToCloudinary(file, undefined, onProgress);
    onProgress?.(100);
    return cloudinaryUrl;
  } catch (err) {
    console.warn('Cloudinary upload not configured or failed, using instant base64 image encoding:', err);
  }

  // 2. Instant, guaranteed client-side compressed image
  onProgress?.(80);
  const base64Url = await fileToBase64(file);
  onProgress?.(100);
  return base64Url;
};

// Operation Types for error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test helper as specified in skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Auth Helpers
export const signInWithGoogle = async () => {
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
};

export const signUpWithEmail = async (email: string, pass: string, name?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    return userCredential.user;
  } catch (err) {
    console.error('Email Sign-Up Error:', err);
    throw err;
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (err) {
    console.error('Email Sign-In Error:', err);
    throw err;
  }
};

export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Logout error:', err);
    throw err;
  }
};
