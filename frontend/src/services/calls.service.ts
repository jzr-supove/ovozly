/**
 * Calls Service
 *
 * Handles call-related API operations including fetching calls,
 * uploading audio, and checking task status.
 */

import apiClient from "./api";
import { CallRecord } from "@/pages/calls/types/callsTypes";

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

/**
 * Fetch all calls for the current user.
 *
 * @returns Promise resolving to array of call records
 */
export const fetchCalls = async (): Promise<CallRecord[]> => {
  const response = await apiClient.get<CallRecord[]>("/stt/calls");
  return response.data;
};

/**
 * Upload an audio file for processing.
 *
 * @param file - Audio file to upload
 * @returns Promise resolving to the created call record
 */
export const uploadAudio = async (file: File): Promise<CallRecord> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<CallRecord>(
    "/stt/submit-audio",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
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
