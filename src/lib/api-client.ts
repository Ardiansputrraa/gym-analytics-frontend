import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gym_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to extract standard API response envelope
apiClient.interceptors.response.use(
  (response) => {
    // If backend returns standard envelope { success, data, message }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('gym_access_token');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && !window.location.pathname.startsWith('/verify-email') && !window.location.pathname.startsWith('/forgot-password') && !window.location.pathname.startsWith('/reset-password')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
