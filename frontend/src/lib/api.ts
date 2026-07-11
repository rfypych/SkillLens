const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

const fetchWithInterceptor = async (endpoint: string, options: FetchOptions = {}, _isRetry: boolean = false): Promise<any> => {
  const { requireAuth = true, headers = {}, ...restOptions } = options;

  const requestHeaders = new Headers(headers as HeadersInit);
  
  // Always accept JSON
  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }

  // Set Content-Type for bodies that are not FormData
  if (options.body && !(options.body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const url = `${API_URL}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
  
  let response;
  try {
    response = await fetch(url, {
      ...restOptions,
      credentials: 'include',
      headers: requestHeaders,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timeout. Please check if the server is running or try disabling browser extensions.');
    }
    throw err;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = 'An error occurred';
    
    if (errorData.detail) {
      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map((err: any) => {
          const locStr = err.loc ? err.loc.join('.') : '';
          return locStr ? `${locStr}: ${err.msg}` : err.msg;
        }).join(', ');
      } else {
        errorMessage = JSON.stringify(errorData.detail);
      }
    } else {
      errorMessage = response.statusText || 'An error occurred';
    }
    
    // Auto-logout on 401, but try refresh first
    if (response.status === 401 && typeof window !== 'undefined') {
      if (!_isRetry && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
        try {
          await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
          // If refresh succeeds, retry the original request
          return fetchWithInterceptor(endpoint, options, true);
        } catch {
          // If refresh fails, redirect to login
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
            window.location.href = '/login';
          }
        }
      } else {
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    
    throw new Error(errorMessage);
  }

  // Check if response is json before parsing
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

export const api = {
  get: (endpoint: string, options?: FetchOptions) => 
    fetchWithInterceptor(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint: string, data?: any, options?: FetchOptions) => {
    let body = data;
    if (data && !(data instanceof FormData) && typeof data !== 'string') {
      body = JSON.stringify(data);
    }
    return fetchWithInterceptor(endpoint, { ...options, method: 'POST', body });
  },
    
  put: (endpoint: string, data?: any, options?: FetchOptions) => {
    let body = data;
    if (data && !(data instanceof FormData) && typeof data !== 'string') {
      body = JSON.stringify(data);
    }
    return fetchWithInterceptor(endpoint, { ...options, method: 'PUT', body });
  },
    
  delete: (endpoint: string, options?: FetchOptions) => 
    fetchWithInterceptor(endpoint, { ...options, method: 'DELETE' }),
};
