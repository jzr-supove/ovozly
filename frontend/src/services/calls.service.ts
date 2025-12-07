/**
 * Calls Service
 *
 * Handles call-related API operations including fetching calls,
 * uploading audio with progress tracking, and checking task status.
 */

import apiClient from "./api";
import {
  CallRecord,
  CallStatus,
  SortField,
  SortOrder,
} from "@/pages/calls/types/callsTypes";

/** Task status response from API */
export interface TaskStatusResponse {
  status: string;
  result: {
    detail?: string;
    call_metadata?: {
      language: string;
    };
    speech_analysis?: unknown;
    summary_analysis?: unknown;
    action_recommendations?: unknown[];
  };
}

/** Upload progress callback */
export type UploadProgressCallback = (progress: number) => void;

/** Fetch calls options */
export interface FetchCallsOptions {
  status?: CallStatus;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

/**
 * Fetch all calls for the current user with optional filtering and sorting.
 *
 * @param options - Optional filtering and sorting parameters
 * @returns Promise resolving to array of call records
 */
export const fetchCalls = async (
  options?: FetchCallsOptions
): Promise<CallRecord[]> => {
  const params = new URLSearchParams();

  if (options?.status) {
    params.append("status", options.status);
  }
  if (options?.sortBy) {
    params.append("sort_by", options.sortBy);
  }
  if (options?.sortOrder) {
    params.append("sort_order", options.sortOrder);
  }

  const queryString = params.toString();
  const url = queryString ? `/stt/calls?${queryString}` : "/stt/calls";

  const response = await apiClient.get<CallRecord[]>(url);
  return response.data;
};

/**
 * Upload an audio file for processing with progress tracking.
 *
 * @param file - Audio file to upload
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise resolving to the created call record
 */
export const uploadAudio = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<CallRecord> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<CallRecord>(
    "/stt/submit-audio",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    }
  );
  return response.data;
};

/**
 * Get the status of a processing task.
 *
 * @param taskId - Celery task ID
 * @returns Promise resolving to task status
 */
export const getTaskStatus = async (
  taskId: string
): Promise<TaskStatusResponse> => {
  const response = await apiClient.get<TaskStatusResponse>(
    `/stt/task-status?task_id=${taskId}`
  );
  return response.data;
};

/**
 * Fetch status for multiple calls at once.
 * Returns a map of celery_task_id -> status
 *
 * @param taskIds - Array of Celery task IDs
 * @returns Promise resolving to map of task statuses
 */
export const fetchCallStatuses = async (
  taskIds: string[]
): Promise<Map<string, CallStatus>> => {
  const statusMap = new Map<string, CallStatus>();

  // Fetch statuses in parallel
  const results = await Promise.allSettled(
    taskIds.map(async (taskId) => {
      const response = await getTaskStatus(taskId);
      return { taskId, status: response.status as CallStatus };
    })
  );

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      statusMap.set(result.value.taskId, result.value.status);
    }
  });

  return statusMap;
};

/**
 * Delete a call recording and its associated data.
 *
 * @param callId - UUID of the call to delete
 * @returns Promise resolving to success message
 */
export const deleteCall = async (callId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/stt/call/${callId}`
  );
  return response.data;
};
