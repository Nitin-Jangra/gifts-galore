const API_BASE = '/api/v1';

let cachedCsrfToken = null;

/**
 * Fetch and cache CSRF token from backend
 */
export async function getCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    const res = await fetch(`${API_BASE}/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
  }
  return null;
}

/**
 * Enhanced fetch wrapper with CSRF injection and JSON handling
 */
export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = await getCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If CSRF error occurs, clear cache for subsequent retry
    if (data.code === 'CSRF_INVALID' || data.code === 'CSRF_MISSING') {
      cachedCsrfToken = null;
    }
    const error = new Error(data.message || 'An error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (url, opts) => apiRequest(url, { ...opts, method: 'GET' }),
  post: (url, body, opts) => apiRequest(url, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put: (url, body, opts) => apiRequest(url, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
  delete: (url, opts) => apiRequest(url, { ...opts, method: 'DELETE' }),
};
