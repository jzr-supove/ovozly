/**
 * API Service
 *
 * Provides a centralized HTTP client with authentication handling,
 * error processing, and request/response interceptors.
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/config/api";

/** Authentication token storage key */
const AUTH_TOKEN_KEY = "authToken";

/**
 * Get the stored authentication token.
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Store the authentication token.
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Remove the authentication token.
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Check if user is authenticated.
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Configured Axios instance with interceptors.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Type-safe API error extractor.
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail || error.message || "Request failed";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
