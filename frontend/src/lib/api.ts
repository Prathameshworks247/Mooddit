/**
 * API base URL for backend. Set VITE_API_URL when building for production.
 * Defaults to http://localhost:8000 for local development.
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? "http://localhost:8000";
}
