import {
  ProjectKnowledgeItem,
  ProjectKnowledgeSearchItem,
  ProjectKnowledgeSearchResponse,
  CreateProjectKnowledgeInput,
  UpdateProjectKnowledgeInput,
} from '../types';
import { getValidBearerToken, getApiBaseUrl, clearStoredToken, AuthError } from './auth';

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Helper to make authorized requests with automatic 401 retry once
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  customBaseUrl?: string
): Promise<T> {
  const baseUrl = customBaseUrl || getApiBaseUrl();
  const url = `${baseUrl.replace(/\/+$/, '')}${path}`;

  let token: string;
  try {
    token = await getValidBearerToken(baseUrl);
  } catch (err) {
    if (err instanceof AuthError) {
      throw err;
    }
    throw new AuthError(err instanceof Error ? err.message : 'Authentication required', 401);
  }

  const makeRequest = async (authToken: string) => {
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${authToken}`);
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  let res = await makeRequest(token);

  // If 401, attempt silent token refresh once if credentials exist
  if (res.status === 401) {
    clearStoredToken();
    try {
      token = await getValidBearerToken(baseUrl);
      res = await makeRequest(token);
    } catch {
      throw new AuthError('Authentication failed (401 Unauthorized). Please check credentials in Settings.', 401);
    }
  }

  if (res.status === 403) {
    clearStoredToken();
    throw new AuthError('Forbidden (403). Insufficient permissions to perform this action.', 403);
  }

  if (!res.ok) {
    let errorMessage = `API Request failed with status ${res.status}`;
    let errorData: any = null;
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await res.json();
        if (errorData && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
      } else {
        const text = await res.text();
        if (text) errorMessage = text;
      }
    } catch {
      // Keep status message
    }
    throw new ApiError(errorMessage, res.status, errorData);
  }

  // Handle successful response
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  const text = await res.text();
  // If response is a JSON string wrapped in quotes or plain string
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * Get latest entries when search term is empty (or when user open/refresh app)
 * GET /api/project-knowledge/latest
 */
export async function getLatestProjectKnowledge(): Promise<ProjectKnowledgeSearchResponse> {
  const path = '/api/project-knowledge/latest';
  return apiFetch<ProjectKnowledgeSearchResponse>(path, { method: 'GET' });
}

/**
 * Search project knowledge entries
 * GET /api/project-knowledge/search?query=<text>&project=<optional>&category=<optional>&top=<optional>
 */
export async function searchProjectKnowledge(params: {
  query: string;
  project?: string;
  category?: string;
  top?: number;
}): Promise<ProjectKnowledgeSearchResponse> {
  const searchParams = new URLSearchParams();
  if (params.query.trim()) {
    searchParams.append('query', params.query.trim());
  }
  if (params.project && params.project.trim() !== '' && params.project !== 'all') {
    searchParams.append('project', params.project.trim());
  }
  if (params.category && params.category.trim() !== '' && params.category !== 'all') {
    searchParams.append('category', params.category.trim());
  }
  if (params.top && params.top >= 1 && params.top <= 20) {
    searchParams.append('top', params.top.toString());
  }

  const queryString = searchParams.toString();
  const path = `/api/project-knowledge/search?${queryString}`;
  return apiFetch<ProjectKnowledgeSearchResponse>(path, { method: 'GET' });
}

/**
 * Get one entry by ID
 * GET /api/project-knowledge/{id}
 */
export async function getProjectKnowledge(id: string): Promise<ProjectKnowledgeItem> {
  const path = `/api/project-knowledge/${encodeURIComponent(id)}`;
  return apiFetch<ProjectKnowledgeItem>(path, { method: 'GET' });
}

/**
 * Add a new project knowledge entry
 * POST /api/project-knowledge
 */
export async function createProjectKnowledge(
  input: CreateProjectKnowledgeInput
): Promise<ProjectKnowledgeItem> {
  const path = '/api/project-knowledge';
  const body = JSON.stringify({
    project: input.project,
    title: input.title,
    content: input.content,
    category: input.category || 'general',
    tags: input.tags || '',
    source: input.source || 'manual',
  });

  return apiFetch<ProjectKnowledgeItem>(path, {
    method: 'POST',
    body,
  });
}

/**
 * Update an entry by ID
 * PATCH /api/project-knowledge/{id}
 */
export async function updateProjectKnowledge(
  id: string,
  input: UpdateProjectKnowledgeInput
): Promise<ProjectKnowledgeItem> {
  const path = `/api/project-knowledge/${encodeURIComponent(id)}`;
  const body = JSON.stringify(input);

  return apiFetch<ProjectKnowledgeItem>(path, {
    method: 'PATCH',
    body,
  });
}

/**
 * Delete an entry by ID
 * DELETE /api/project-knowledge/{id}
 */
export async function deleteProjectKnowledge(id: string): Promise<string> {
  const path = `/api/project-knowledge/${encodeURIComponent(id)}`;
  return apiFetch<string>(path, {
    method: 'DELETE',
  });
}
