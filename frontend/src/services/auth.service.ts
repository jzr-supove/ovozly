/**
 * Authentication Service
 *
 * Handles user authentication operations including login and logout.
 */

import apiClient, { setAuthToken, removeAuthToken } from "./api";

/** Login credentials */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Login response from API */
export interface LoginResponse {
  access_token: string;
}

/**
 * Authenticate user with email and password.
 *
 * @param credentials - User login credentials
 * @returns Promise resolving to login response
 */
export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/users/authorize",
    credentials
  );
  const { access_token } = response.data;
  setAuthToken(access_token);
  return response.data;
};

/**
 * Log out the current user.
 */
export const logout = (): void => {
  removeAuthToken();
};
