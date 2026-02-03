export const API_BASE: string = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:8000';

export function apiUrl(path: string) {
  if (!path) return API_BASE;
  if (path.startsWith('/')) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

export default apiUrl;
