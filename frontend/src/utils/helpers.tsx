/**
 * Helper Utilities
 *
 * Common utility functions for data formatting and transformation.
 */

import { format } from "date-fns";

/**
 * Format a date string to a human-readable format.
 *
 * @param dateString - ISO date string or Date-parseable string
 * @returns Formatted date string (e.g., "06 Dec 2025, 01:43 pm")
 */
export const formatCreatedAt = (dateString: string | undefined): string => {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy, hh:mm a");
  } catch {
    return "—";
  }
};

/**
 * Format a date string to a shorter format.
 *
 * @param dateString - ISO date string or Date-parseable string
 * @returns Formatted date string (e.g., "Dec 7, 2025")
 */
export const formatDateShort = (dateString: string | undefined): string => {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  } catch {
    return "—";
  }
};

/**
 * Format a date string to time only.
 *
 * @param dateString - ISO date string or Date-parseable string
 * @returns Formatted time string (e.g., "1:40 AM")
 */
export const formatTimeShort = (dateString: string | undefined): string => {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  } catch {
    return "—";
  }
};

/**
 * Format duration in seconds to a human-readable format.
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "5m 30s")
 */
export const formatDuration = (seconds: number | undefined): string => {
  if (!seconds && seconds !== 0) return "—";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Capitalize the first letter of a string.
 *
 * @param str - Input string
 * @returns String with first letter capitalized
 */
export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
