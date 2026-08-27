// src/cpanel-database.ts - Production MySQL & cPanel api.php Database Bridge for bskbd.org
import {
  db as cpanelDb,
  auth as cpanelAuth,
  collection as cpanelCollection,
  doc as cpanelDoc,
  getDoc as cpanelGetDoc,
  getDocs as cpanelGetDocs,
  setDoc as cpanelSetDoc,
  deleteDoc as cpanelDeleteDoc,
  addDoc as cpanelAddDoc,
  query as cpanelQuery,
  orderBy as cpanelOrderBy,
  where as cpanelWhere,
  limit as cpanelLimit,
  onSnapshot as cpanelOnSnapshot,
  serverTimestamp as cpanelServerTimestamp,
  getDocFromServer as cpanelGetDocFromServer,
  signInAnonymously as cpanelSignInAnonymously,
  signOut as cpanelSignOut,
  signInWithPopup as cpanelSignInWithPopup,
  GoogleAuthProvider as CpanelGoogleAuthProvider,
} from './firebase-mock';

import {
  verifyAdminCredentials,
  uploadImageToServer,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  cpanelApi,
} from './services/cpanelApi';

export const db = cpanelDb;
export const auth = cpanelAuth;

export const collection = cpanelCollection;
export const doc = cpanelDoc;
export const getDoc = cpanelGetDoc;
export const getDocs = cpanelGetDocs;
export const setDoc = cpanelSetDoc;
export const deleteDoc = cpanelDeleteDoc;
export const addDoc = cpanelAddDoc;
export const query = cpanelQuery;
export const orderBy = cpanelOrderBy;
export const where = cpanelWhere;
export const limit = cpanelLimit;
export const onSnapshot = cpanelOnSnapshot;
export const serverTimestamp = cpanelServerTimestamp;
export const getDocFromServer = cpanelGetDocFromServer;

export const signInAnonymously = cpanelSignInAnonymously;
export const signOut = cpanelSignOut;
export const signInWithPopup = cpanelSignInWithPopup;
export const GoogleAuthProvider = CpanelGoogleAuthProvider;

export {
  verifyAdminCredentials,
  uploadImageToServer,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  cpanelApi,
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface DatabaseErrorInfo {
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

export type FirestoreErrorInfo = DatabaseErrorInfo;

export function handleDatabaseError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.warn(`[cPanel MySQL Database Sync] Operation: ${operationType} on "${path}". Notice:`, errorMsg);
}

export function removeUndefinedFields(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(removeUndefinedFields);
  const clean: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      clean[key] = removeUndefinedFields(val);
    }
  }
  return clean;
}

export const handleFirestoreError = handleDatabaseError;
