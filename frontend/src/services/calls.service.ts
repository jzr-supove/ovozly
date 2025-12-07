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
  CallWithAnalysis,
  SortField,
  SortOrder,
} from "@/pages/calls/types/callsTypes";

/** Task status response from API (for polling during processing) */
export interface TaskStatusResponse {
  status: string;
  call_id?: number;
  result?: {
    detail?: string;
    call_id?: number;
    status?: string;
    analysis_id?: string;
    // Legacy fields (from Celery result, before database persistence)
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
  sentiment?: string;
  resolution?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

/**
 * Fetch all calls for the current user with optional filtering and sorting.
 * Returns calls with analysis summary for list views.
 *
 * @param options - Optional filtering and sorting parameters
 * @returns Promise resolving to array of call records with analysis summary
 */
export const fetchCalls = async (
  options?: FetchCallsOptions
): Promise<CallRecord[]> => {
  const params = new URLSearchParams();

  if (options?.status) {
    params.append("status", options.status);
  }
  if (options?.sentiment) {
    params.append("sentiment", options.sentiment);
  }
  if (options?.resolution) {
    params.append("resolution", options.resolution);
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
 * Fetch a single call with full analysis data.
 *
 * @param callId - Call ID (integer)
 * @returns Promise resolving to call with full analysis
 */
export const fetchCallDetails = async (
  callId: number | string
): Promise<CallWithAnalysis> => {
  const response = await apiClient.get<CallWithAnalysis>(`/stt/call/${callId}`);
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
 * Use this for polling during RUNNING/PENDING states.
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
 * @param callId - ID of the call to delete (integer)
 * @returns Promise resolving to success message
 */
export const deleteCall = async (
  callId: number | string
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/stt/call/${callId}`
  );
  return response.data;
};

/**
 * Fetch analytics summary for dashboard widgets.
 *
 * @returns Promise resolving to analytics summary
 */
export const fetchAnalyticsSummary = async (): Promise<{
  total_calls: number;
  total_analyzed: number;
  average_duration_seconds: number;
  sentiment_distribution: Record<string, number>;
  resolution_distribution: Record<string, number>;
  efficiency_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
}> => {
  const response = await apiClient.get("/stt/analytics/summary");
  return response.data;
};
