let activeServerPort = null;

export const getActiveServerPort = () => activeServerPort;

export const setActiveServerPort = (port) => {
  activeServerPort = port;
};

export const isBackendConnectionError = (message = '') => (
  /connection refused|backend request timed out|supabase is not reachable|credentials are incomplete|failed to fetch|connection failed/i.test(message)
);

export const fetchApi = async (endpoint, options = {}, token = null) => {
  const ports = activeServerPort ? [activeServerPort] : [5000, 5001];
  let lastError = null;

  for (const port of ports) {
    try {
      const url = `http://localhost:${port}/api${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(id);

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.message || data.error || 'API request failed.');
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return { data, port };
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError?.name === 'AbortError') {
    throw new Error('Backend request timed out. Supabase may be unreachable or not configured yet.');
  }

  if (lastError?.message === 'Failed to authenticate user.' || lastError?.message?.includes('fetch failed')) {
    throw new Error('Backend is running, but Supabase is not reachable or the Supabase credentials are incomplete.');
  }

  throw lastError || new Error('Connection refused on ports 5000/5001');
};
