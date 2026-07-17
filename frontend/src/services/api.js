import axios from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStorage';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL,
  headers: {

    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

function isAuthEndpoint(url) {
  return url?.includes('/auth/login') || url?.includes('/auth/refresh') || url?.includes('/auth/logout');
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest || originalRequest._retried || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/auth/refresh`, { refreshToken })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const { data } = await refreshPromise;
      setTokens(data.accessToken, data.refreshToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export default api;
