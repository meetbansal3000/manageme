/**
 * Robust IndexedDB + LocalStorage persistence layer for documents and models
 * Prevents file deletion and volatile memory loss on page reloads.
 */

const DB_NAME = 'ManageMePersistenceDB';
const DB_VERSION = 1;
const STORE_NAME = 'study_documents';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDocsToIndexedDB(docs: any[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Clear and re-populate
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const doc of docs) {
      store.put(doc);
    }
    
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
    });
  } catch (err) {
    console.warn('[Storage] IndexedDB save failed, fallback to LocalStorage:', err);
  }
}

export async function loadDocsFromIndexedDB(): Promise<any[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn('[Storage] IndexedDB load failed:', err);
    return [];
  }
}

export function saveStudyDocs(docs: any[]): void {
  try {
    localStorage.setItem('manageme_study_docs', JSON.stringify(docs));
  } catch (e) {
    console.warn('[Storage] LocalStorage quota exceeded, relying on IndexedDB:', e);
  }
  saveDocsToIndexedDB(docs);
}

export function getSavedStudyDocs(): any[] {
  try {
    const saved = localStorage.getItem('manageme_study_docs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('[Storage] Error reading study docs from LocalStorage:', e);
  }
  return [];
}
