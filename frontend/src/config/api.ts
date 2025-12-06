/**
 * API Configuration
 *
 * Centralizes API endpoint configuration using environment variables.
 * Falls back to localhost for development if not configured.
 */

/** Base URL for the backend API */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/** API endpoint paths */
export const API_ENDPOINTS = {
  /** Authentication endpoints */
  AUTH: {
    LOGIN: `${API_BASE_URL}/users/authorize`,
    REGISTER: `${API_BASE_URL}/users`,
  },

  /** Speech-to-text endpoints */
  STT: {
    SUBMIT_AUDIO: `${API_BASE_URL}/stt/submit-audio`,
    CALLS: `${API_BASE_URL}/stt/calls`,
    TASK_STATUS: (taskId: string) =>
      `${API_BASE_URL}/stt/task-status?task_id=${taskId}`,
  },
} as const;
