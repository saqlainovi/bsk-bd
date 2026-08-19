// src/firebase.ts - Production MySQL + api.php Database & Auth Bridge for cPanel / bskbd.org
import {
  db as mockDb,
  auth as mockAuth,
  collection as mockCollection,
  doc as mockDoc,
  getDoc as mockGetDoc,
  getDocs as mockGetDocs,
  setDoc as mockSetDoc,
  deleteDoc as mockDeleteDoc,
  addDoc as mockAddDoc,
  query as mockQuery,
  orderBy as mockOrderBy,
  where as mockWhere,
  limit as mockLimit,
  onSnapshot as mockOnSnapshot,
  serverTimestamp as mockServerTimestamp,
  getDocFromServer as mockGetDocFromServer,
  signInAnonymously as mockSignInAnonymously,
  signOut as mockSignOut,
  signInWithPopup as mockSignInWithPopup,
  GoogleAuthProvider as MockGoogleAuthProvider,
  verifyAdminCredentials,
  uploadImageToServer,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
} from './firebase-mock';

export const db = mockDb || { _mock: true };
export const auth = mockAuth;

export const collection = mockCollection;
export const doc = mockDoc;
export const getDoc = mockGetDoc;
export const getDocs = mockGetDocs;
export const setDoc = mockSetDoc;
export const deleteDoc = mockDeleteDoc;
export const addDoc = mockAddDoc;
export const query = mockQuery;
export const orderBy = mockOrderBy;
export const where = mockWhere;
export const limit = mockLimit;
export const onSnapshot = mockOnSnapshot;
export const serverTimestamp = mockServerTimestamp;
export const getDocFromServer = mockGetDocFromServer;

export const signInAnonymously = mockSignInAnonymously;
export const signOut = mockSignOut;
export const signInWithPopup = mockSignInWithPopup;
export const GoogleAuthProvider = MockGoogleAuthProvider;

export {
  verifyAdminCredentials,
  uploadImageToServer,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
};

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.warn(`[Database Sync] Operation: ${operationType} on "${path}". Notice:`, errorMsg);
}
