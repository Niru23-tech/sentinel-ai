// SentinelX AI - Core API Client & HTTP Transport Layer

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const TOKEN_STORAGE_KEY = 'sentinelx_access_token';
const REFRESH_TOKEN_KEY = 'sentinelx_refresh_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setAuthToken = (token: string, refreshToken?: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = endpoint.startsWith('/api') 
      ? `${API_BASE_URL}${endpoint}` 
      : `${API_BASE_URL}/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.detail || errorData.message || `HTTP Error ${response.status}`,
        errorCode: `ERR_${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.warn(`[SentinelX API] Backend server unreachable at ${endpoint}, falling back to standalone security engine.`, error);
    return {
      success: false,
      message: 'Network request failed. Using offline SentinelX Trust Engine.',
      errorCode: 'OFFLINE_MODE',
    };
  }
}
