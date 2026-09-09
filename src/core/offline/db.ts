const DB_NAME = 'atencion-offline'
const DB_VERSION = 1
const STORE_NAME = 'pending_actions'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const request = fn(tx.objectStore(STORE_NAME))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const offlineDb = {
  put: <T>(value: T) => withStore('readwrite', (store) => store.put(value)),
  delete: (id: string) => withStore('readwrite', (store) => store.delete(id)),
  getAll: <T>() => withStore<T[]>('readonly', (store) => store.getAll() as IDBRequest<T[]>),
}
