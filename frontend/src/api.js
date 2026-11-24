const BASE = '/api';
const TOKEN_KEY = 'insight-token';

export const token = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (value) => {
    try {
      localStorage.setItem(TOKEN_KEY, value);
    } catch {
      /* private mode — session only */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

async function request(path, options = {}) {
  const current = token.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(current ? { Authorization: `Bearer ${current}` } : {}),
    ...(options.headers || {}),
  };
  let response;
  try {
    response = await fetch(BASE + path, { headers, ...options });
  } catch {
    throw new Error('BACKEND_OFFLINE');
  }
  if (response.status === 401) {
    // A 401 on login/register means bad credentials, not an expired session —
    // let the server's message flow through. Anywhere else, drop the session.
    const credentialAttempt = path === '/auth/login' || path === '/auth/register';
    if (!credentialAttempt) {
      token.clear();
      throw new Error('AUTH_REQUIRED');
    }
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body && body.message) message = body.message;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  // threads
  threads: (type) => request(`/threads${type ? `?type=${encodeURIComponent(type)}` : ''}`),
  thread: (id) => request(`/threads/${encodeURIComponent(id)}`),
  createThread: (body) => request('/threads', { method: 'POST', body: JSON.stringify(body) }),
  deleteThread: (id) => request(`/threads/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  messages: (threadId) => request(`/threads/${encodeURIComponent(threadId)}/messages`),
  addMessage: (threadId, body) =>
    request(`/threads/${encodeURIComponent(threadId)}/messages`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  signal: () => request('/signal/today'),
  scan: () => request('/scan', { method: 'POST' }),
  exportCsvUrl: `${BASE}/threads/export.csv`,
};
