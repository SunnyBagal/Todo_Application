import { useAuthStore } from "@/stores/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiClient(endpoint, options = {}) {
  const token = useAuthStore.getState().token;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object'){
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new Error('Session expired');
  }

  if (!res.ok){
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${res.status}`);
  }

  return res.json();

}

export const api = {
  get: (endpoint) => apiClient(endpoint),

  post: (endpoint, data) =>
    apiClient(endpoint, { method: 'POST', body: data }),

  patch: (endpoint, data) =>
    apiClient(endpoint, { method: 'PATCH', body: data }),

  delete: (endpoint) =>
    apiClient(endpoint, { method: 'DELETE' }),
};
