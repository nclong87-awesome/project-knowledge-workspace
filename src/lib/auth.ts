import { StoredAuthToken } from '../types';

const STORAGE_KEY = 'project-knowledge.auth';
const SAFETY_MARGIN_MS = 60 * 1000; // 60 seconds

// In-memory credentials store (never persisted to localStorage)
let inMemoryClientId: string | null = null;
let inMemoryClientSecret: string | null = null;
let inFlightTokenPromise: Promise<string> | null = null;

export class AuthError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Get configured API base URL from env or fallback
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:5204';
}

/**
 * Set in-memory client credentials
 */
export function setInMemoryCredentials(clientId: string, clientSecret: string) {
  inMemoryClientId = clientId.trim();
  inMemoryClientSecret = clientSecret.trim();
}

/**
 * Get in-memory credentials
 */
export function getInMemoryCredentials() {
  return {
    clientId: inMemoryClientId,
    clientSecret: inMemoryClientSecret,
  };
}

/**
 * Clear in-memory credentials
 */
export function clearInMemoryCredentials() {
  inMemoryClientId = null;
  inMemoryClientSecret = null;
}

/**
 * Read stored token from localStorage
 */
export function getStoredToken(): StoredAuthToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthToken;
    if (parsed && typeof parsed.accessToken === 'string' && typeof parsed.expiresAt === 'number') {
      return parsed;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

/**
 * Save stored token to localStorage
 */
export function saveStoredToken(accessToken: string, expiresInSeconds: number): StoredAuthToken {
  const tokenRecord: StoredAuthToken = {
    accessToken,
    tokenType: 'Bearer',
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenRecord));
  } catch (err) {
    console.error('Failed to save auth token to localStorage:', err);
  }
  return tokenRecord;
}

/**
 * Remove stored token from localStorage
 */
export function clearStoredToken() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear auth token:', err);
  }
}

/**
 * Perform OAuth client credentials flow to obtain token
 */
export async function fetchOAuthToken(
  apiBaseUrl: string,
  clientId: string,
  clientSecret: string
): Promise<StoredAuthToken> {
  const endpoint = `${apiBaseUrl.replace(/\/+$/, '')}/oauth/token`;
  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'client_credentials');
  bodyParams.append('client_id', clientId);
  bodyParams.append('client_secret', clientSecret);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParams.toString(),
  });

  if (!response.ok) {
    let errorMsg = `Authentication failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      }
    } catch {
      // ignore JSON parse error
    }
    throw new AuthError(errorMsg, response.status);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new AuthError('Token endpoint did not return access_token');
  }

  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600;
  const tokenRecord = saveStoredToken(data.access_token, expiresIn);
  return tokenRecord;
}

/**
 * Check if stored token is currently valid (unexpired + safety margin)
 */
export function isTokenValid(token: StoredAuthToken | null): boolean {
  if (!token) return false;
  return token.expiresAt > Date.now() + SAFETY_MARGIN_MS;
}

/**
 * Check if stored token is strictly unexpired right now (without safety margin)
 */
export function isTokenUnexpired(token: StoredAuthToken | null): boolean {
  if (!token) return false;
  return token.expiresAt > Date.now();
}

/**
 * Get a valid Bearer token, refreshing if necessary via in-memory credentials.
 * Shares single in-flight promise to avoid duplicate concurrent token requests.
 */
export async function getValidBearerToken(customBaseUrl?: string): Promise<string> {
  const stored = getStoredToken();
  if (isTokenValid(stored)) {
    return stored.accessToken;
  }

  // Token is expired or missing or near expiration
  if (!inMemoryClientId || !inMemoryClientSecret) {
    // If token is still unexpired strictly, we can use it, but warn
    if (isTokenUnexpired(stored)) {
      return stored.accessToken;
    }
    throw new AuthError('No valid session or credentials. Please log in.', 401);
  }

  // Deduplicate in-flight token request
  if (inFlightTokenPromise) {
    return inFlightTokenPromise;
  }

  const baseUrl = customBaseUrl || getApiBaseUrl();
  inFlightTokenPromise = (async () => {
    try {
      const tokenRecord = await fetchOAuthToken(baseUrl, inMemoryClientId!, inMemoryClientSecret!);
      return tokenRecord.accessToken;
    } finally {
      inFlightTokenPromise = null;
    }
  })();

  return inFlightTokenPromise;
}

/**
 * Full logout: clear local storage token and in-memory credentials
 */
export function logout() {
  clearStoredToken();
  clearInMemoryCredentials();
}
