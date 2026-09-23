const STORAGE_KEY = 'finanzas_session_encrypted';
const DATABASE_NAME = 'finanzas_secure_storage';
const DATABASE_VERSION = 1;
const KEY_STORE_NAME = 'keys';
const ENCRYPTION_KEY_ID = 'auth-session-key';
const LEGACY_STORAGE_KEYS = ['finanzas_token', 'finanzas_user'];

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();

// This keeps localStorage ciphertext-only; same-origin JavaScript can still use the key.

function removeLegacyStorage() {
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

function assertCryptoSupport() {
  if (!globalThis.crypto?.subtle || !globalThis.indexedDB) {
    throw new Error('El almacenamiento cifrado requiere un navegador compatible y una conexión HTTPS.');
  }
}

function openKeyDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(KEY_STORE_NAME)) {
        request.result.createObjectStore(KEY_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir el almacén de claves.'));
  });
}

async function getEncryptionKey() {
  assertCryptoSupport();
  const database = await openKeyDatabase();

  try {
    const savedKey = await new Promise((resolve, reject) => {
      const transaction = database.transaction(KEY_STORE_NAME, 'readonly');
      const request = transaction.objectStore(KEY_STORE_NAME).get(ENCRYPTION_KEY_ID);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error ?? new Error('No se pudo leer la clave de sesión.'));
    });

    if (savedKey) return savedKey;

    const newKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );

    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(KEY_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(KEY_STORE_NAME);
      const request = store.get(ENCRYPTION_KEY_ID);
      let selectedKey;

      request.onsuccess = () => {
        selectedKey = request.result ?? newKey;
        if (!request.result) store.put(newKey, ENCRYPTION_KEY_ID);
      };
      request.onerror = () => reject(request.error ?? new Error('No se pudo leer la clave de sesión.'));
      transaction.oncomplete = () => resolve(selectedKey);
      transaction.onerror = () => reject(transaction.error ?? new Error('No se pudo guardar la clave de sesión.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Se canceló el acceso a la clave de sesión.'));
    });
  } finally {
    database.close();
  }
}

function encodeBase64(bytes) {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function decodeBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
  removeLegacyStorage();
}

export async function prepareSessionStorage() {
  await getEncryptionKey();
}

export async function saveStoredSession(session) {
  removeLegacyStorage();
  assertCryptoSupport();

  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = utf8Encoder.encode(JSON.stringify(session));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  const envelope = {
    version: 1,
    iv: encodeBase64(iv),
    ciphertext: encodeBase64(new Uint8Array(ciphertext)),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

export async function readStoredSession() {
  removeLegacyStorage();
  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue) return null;

  assertCryptoSupport();

  let envelope;
  try {
    envelope = JSON.parse(storedValue);
  } catch {
    clearStoredSession();
    return null;
  }

  if (envelope?.version !== 1 || typeof envelope.iv !== 'string' || typeof envelope.ciphertext !== 'string') {
    clearStoredSession();
    return null;
  }

  const key = await getEncryptionKey();
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: decodeBase64(envelope.iv) },
      key,
      decodeBase64(envelope.ciphertext),
    );
    const session = JSON.parse(utf8Decoder.decode(plaintext));

    if (typeof session?.token !== 'string' || !session.user?.id || !session.user?.email) {
      clearStoredSession();
      return null;
    }

    return session;
  } catch {
    clearStoredSession();
    return null;
  }
}

export async function getStoredAuthToken() {
  const session = await readStoredSession();
  return session?.token ?? null;
}
