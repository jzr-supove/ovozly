/**
 * Call Types and Interfaces
 *
 * Type definitions for call-related data structures.
 */

/** Client categories for call classification */
export enum ClientCategory {
  PotentialClient = "Potential Client",
  Client = "Client",
  SalaryClient = "Salary Client",
  Partner = "Partner",
}

/** Call processing status */
export enum CallStatus {
  SUCCESS = "SUCCESS",
  RUNNING = "RUNNING",
  FAILED = "FAILED",
  PENDING = "PENDING",
}

/** Call type classification */
export enum CallType {
  Inquiry = "Inquiry",
  Complaint = "Complaint",
  Request = "Request",
}

/** Call record from API */
export interface CallRecord {
  /** URL or identifier for the audio file */
  file_id: string;
  /** Unique call identifier */
  id: string;
  /** Agent who handled the call */
  agent_id: string;
  /** Duration of the call */
  call_duration: string | number;
  /** Timestamp when call was created */
  created_at: string;
  /** Processing status */
  status: CallStatus;
  /** Celery task ID for async processing */
  celery_task_id: string;
}
