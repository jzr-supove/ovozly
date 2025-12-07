/**
 * Call Types and Interfaces
 *
 * Type definitions for call-related data structures matching backend API.
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

/** Intent detected in conversation */
export interface Intent {
  id: string;
  intent: string;
  confidence_score: number | null;
  created_at: string;
}

/** Entity extracted from conversation */
export interface ExtractedEntity {
  id: string;
  entity_type: string;
  value: string;
  confidence_score: number | null;
  created_at: string;
}

/** Issue identified in conversation */
export interface Issue {
  id: string;
  issue_type: string;
  description: string;
  created_at: string;
}

/** Recommended action */
export interface Action {
  id: string;
  action_type: string;
  details: string;
  created_at: string;
}

/** Key point from summary */
export interface Keypoint {
  id: string;
  point: string;
  created_at: string;
}

/** Diarization segment with speaker and timestamps */
export interface DiarizationSegment {
  speaker: string;
  start: number;
  end: number;
  text?: string;
}

/** Full speech analysis from database */
export interface SpeechAnalysis {
  id: string;
  call_id: number;
  language: string;
  transcript: string;
  raw_diarization: DiarizationSegment[] | null;
  customer_sentiment: string | null;
  agent_sentiment: string | null;
  overall_sentiment: string | null;
  call_efficiency: string | null;
  resolution_status: string | null;
  created_at: string;
  intents: Intent[];
  extracted_entities: ExtractedEntity[];
  issues: Issue[];
  actions: Action[];
  keypoints: Keypoint[];
}

/** Simplified analysis summary for list views */
export interface SpeechAnalysisSummary {
  id: string;
  language: string;
  overall_sentiment: string | null;
  call_efficiency: string | null;
  resolution_status: string | null;
  created_at: string;
}

/** Call record from API */
export interface CallRecord {
  /** Unique call identifier */
  id: number | string;
  /** URL or identifier for the audio file */
  file_id: string;
  /** Original filename of the audio file */
  file_name: string;
  /** Agent who handled the call */
  agent_id: number | string;
  /** Duration of the call in seconds */
  call_duration: number;
  /** Processing status */
  status: CallStatus;
  /** Celery task ID for async processing */
  celery_task_id: string | null;
  /** Timestamp when call was created */
  created_at: string;
  /** Analysis summary (included in list response) */
  speech_analysis?: SpeechAnalysisSummary | null;
  /** Whether this is a local upload in progress (frontend only) */
  isUploading?: boolean;
  /** Upload progress percentage (frontend only) */
  uploadProgress?: number;
}

/** Call with full analysis data (for detail view) */
export interface CallWithAnalysis extends Omit<CallRecord, "speech_analysis"> {
  /** Full speech analysis with all nested entities */
  speech_analysis: SpeechAnalysis | null;
}

/** Sort field options */
export type SortField = "created_at" | "call_duration" | "file_name";

/** Sort order options */
export type SortOrder = "asc" | "desc";
