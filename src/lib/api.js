import { clearStoredSession, getStoredAuthToken } from '@/lib/secureSession';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '')
  .trim()
  .replace(/\/+$/, '');

function buildUrl(path) {
  if (!API_BASE_URL) {
    throw new Error('Falta configurar la variable VITE_API_URL.');
  }

  return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
}

async function readResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(payload, status) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (payload?.errors && typeof payload.errors === 'object') {
    const firstValidationError = Object.values(payload.errors)
      .flat()
      .find((message) => typeof message === 'string' && message.trim());

    if (firstValidationError) {
      return firstValidationError;
    }
  }

  return `La solicitud falló (HTTP ${status}).`;
}

async function request(method, path, body) {
  const headers = new Headers({ Accept: 'application/json' });
  const token = await getStoredAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const options = { method, headers };
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path), options);

  if (response.status === 401) {
    clearStoredSession();
    window.dispatchEvent(new Event('finanzas:session-expired'));
  }

  const payload = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }

  return payload;
}

export function get(path) {
  return request('GET', path);
}

export function post(path, body) {
  return request('POST', path, body);
}

export function put(path, body) {
  return request('PUT', path, body);
}

export function deleteRequest(path) {
  return request('DELETE', path);
}

export const api = {
  get,
  post,
  put,
  delete: deleteRequest,
};
