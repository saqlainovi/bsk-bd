// firebase-mock.ts - High-Performance Database Adapter routing calls to cPanel MySQL API Service
import {
  cpanelApi,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  verifyAdminCredentials,
  uploadImageToServer,
  getApiUrl
} from './services/cpanelApi';

export {
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  verifyAdminCredentials,
  uploadImageToServer,
  getApiUrl
};

// Mock App
export const initializeApp = (_config: any) => {
  return { name: '[BSK-Database-Bridge]' };
};

// Mock Auth State and Actions
export class MockAuth {
  public currentUser: any = null;
  private listeners: Array<(user: any) => void> = [];

  constructor() {
    try {
      const token = getAdminToken();
      if (token) {
        this.currentUser = {
          uid: 'admin-uid-123',
          email: 'admin@bskbd.org',
          displayName: 'BSK Admin',
          isAnonymous: false
        };
      }
    } catch (_) {}
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    setTimeout(() => {
      callback(this.currentUser);
    }, 0);

    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private triggerChange() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  async signInAnonymously() {
    this.currentUser = {
      uid: 'anon-uid-123',
      email: 'anonymous@bskbd.org',
      displayName: 'Anonymous Admin',
      isAnonymous: true
    };
    this.triggerChange();
    return { user: this.currentUser };
  }

  async signInWithPopup(_provider: any) {
    this.currentUser = {
      uid: 'google-uid-123',
      email: 'admin@bskbd.org',
      displayName: 'BSK Google Admin',
      isAnonymous: false
    };
    this.triggerChange();
    return { user: this.currentUser };
  }

  async signOut() {
    clearAdminToken();
    this.currentUser = null;
    this.triggerChange();
    return true;
  }
}

export const auth = new MockAuth();

export const initializeAuth = (_app: any, _options?: any) => {
  return auth;
};

export const getAuth = () => {
  return auth;
};

export const browserLocalPersistence = 'local';
export const browserSessionPersistence = 'session';
export const inMemoryPersistence = 'none';

export const signInAnonymously = async (authObj: MockAuth) => {
  return await authObj.signInAnonymously();
};

export const signOut = async (authObj: MockAuth) => {
  return await authObj.signOut();
};

export const signInWithPopup = async (authObj: MockAuth, provider?: any) => {
  return await authObj.signInWithPopup(provider);
};

export const setPersistence = async (_authObj: any, _persistence: any) => {
  return true;
};

export class GoogleAuthProvider {
  setCustomParameters(_params: any) {}
}

// Mock Firestore references
export class MockDocRef {
  constructor(public collectionName: string, public id: string) {}
}

export class MockCollectionRef {
  constructor(public name: string) {}
}

// Mock Firestore
export const db = { _mock: true };
export const initializeFirestore = (_app: any, _options: any) => {
  return db;
};

export const getFirestore = () => {
  return db;
};

export const persistentLocalCache = () => ({});
export const persistentMultipleTabManager = () => ({});
export const memoryLocalCache = () => ({});

export const serverTimestamp = () => new Date().toISOString();

export function collection(_db: any, name: string) {
  return new MockCollectionRef(name);
}

export function doc(dbOrCol: any, path?: string, ...pathSegments: string[]) {
  if (dbOrCol instanceof MockCollectionRef) {
    return new MockDocRef(dbOrCol.name, path || Math.random().toString(36).substring(2, 15));
  }
  return new MockDocRef(path || '', pathSegments[0] || '');
}

export function query(colRef: any, ..._args: any[]) {
  return colRef;
}

export function orderBy(field: string, direction?: string) {
  return { field, direction };
}

export function where(field: string, op: string, val: any) {
  return { field, op, val };
}

export function limit(num: number) {
  return { limit: num };
}

const createDocSnapshot = (id: string, data: any) => ({
  id,
  exists: () => data !== null && data !== undefined,
  data: () => data,
});

const createQuerySnapshot = (items: any[]) => ({
  empty: items.length === 0,
  size: items.length,
  docs: items.map(item => createDocSnapshot(item.id, item)),
  forEach: (cb: (doc: any) => void) => {
    items.forEach(item => cb(createDocSnapshot(item.id, item)));
  }
});

export async function getDoc(docRef: MockDocRef) {
  const collectionName = docRef.collectionName;
  const id = docRef.id;
  const data = await cpanelApi.getDoc(collectionName, id);
  return createDocSnapshot(id, data);
}

export async function getDocFromServer(docRef: MockDocRef) {
  const collectionName = docRef.collectionName;
  const id = docRef.id;
  const result = await cpanelApi.getDocFromServer(collectionName, id);
  return createDocSnapshot(id, result.data);
}

export async function getDocs(queryOrCol: any) {
  const collectionName = queryOrCol instanceof MockCollectionRef ? queryOrCol.name : (queryOrCol?.collectionName || queryOrCol?.name || '');
  const data = await cpanelApi.getCollection(collectionName);
  return createQuerySnapshot(data || []);
}

export async function setDoc(docRef: MockDocRef, payload: any, options?: { merge?: boolean }) {
  const collectionName = docRef.collectionName;
  const id = docRef.id;

  let finalPayload = payload;
  if (options?.merge) {
    const existing = await cpanelApi.getDoc(collectionName, id);
    finalPayload = { ...(existing || {}), ...payload, id };
  }

  const result = await cpanelApi.setDoc(collectionName, id, finalPayload);
  return result;
}

export async function addDoc(colRef: MockCollectionRef, payload: any) {
  const collectionName = colRef.name;
  return await cpanelApi.addDoc(collectionName, payload);
}

export async function deleteDoc(docRef: MockDocRef) {
  const collectionName = docRef.collectionName;
  const id = docRef.id;
  return await cpanelApi.deleteDoc(collectionName, id);
}

export function onSnapshot(target: any, callback: (snapshot: any) => void, _onError?: (error: any) => void) {
  let isMounted = true;

  const loadData = async () => {
    try {
      if (target instanceof MockDocRef) {
        const snap = await getDoc(target);
        if (isMounted) callback(snap);
      } else if (target instanceof MockCollectionRef || target?.name || target?.collectionName) {
        const snap = await getDocs(target);
        if (isMounted) callback(snap);
      }
    } catch (_) {}
  };

  loadData();

  const handleUpdate = (e: any) => {
    const detailCol = e?.detail?.collection;
    const targetCol = target instanceof MockDocRef ? target.collectionName : (target?.name || target?.collectionName);
    if (!detailCol || !targetCol || detailCol === targetCol) {
      loadData();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('bsk_db_updated', handleUpdate);
  }

  return () => {
    isMounted = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('bsk_db_updated', handleUpdate);
    }
  };
}
