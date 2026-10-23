export const API_PREFIX = '/api/v1' as const;

export type UserRole = 'admin' | 'user' | 'read_only';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface HealthResponse {
  status: 'ok';
  service: 'save-backend';
}
