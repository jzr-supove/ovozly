/**
 * Filter Component
 *
 * Provides status filtering and audio upload functionality with progress tracking.
 */

import { Col, Row, Select, Button, message } from "antd";
import { useRef } from "react";
import { SelectProps } from "antd/es/select";
import { UploadOutlined } from "@ant-design/icons";

import { CallRecord, CallStatus } from "../../types/callsTypes";
import { uploadAudio } from "@/services/calls.service";
import { getErrorMessage } from "@/services/api";
import { capitalize } from "@/utils/helpers";

/** Status filter options */
const statusOptions: SelectProps["options"] = Object.values(CallStatus).map(
  (status) => ({
    label: capitalize(status),
    value: status,
  })
);

/** Component props */
interface FilterProps {
  /** Called when upload starts with filename and temp ID */
  onUploadStart?: (fileName: string, tempId: string) => void;
  /** Called with upload progress (0-100) */
  onUploadProgress?: (tempId: string, progress: number) => void;
  /** Called when upload completes successfully */
  onUploadComplete?: (tempId: string, call: CallRecord) => void;
  /** Called when upload fails */
  onUploadError?: (tempId: string) => void;
  /** Called when status filter changes */
  onStatusFilterChange?: (status: CallStatus | undefined) => void;
  /** Current status filter value */
  statusFilter?: CallStatus;
}

const Filter: React.FC<FilterProps> = ({
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onStatusFilterChange,
  statusFilter,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Handle status filter change.
   */
  const handleStatusChange = (value: CallStatus | undefined) => {
    onStatusFilterChange?.(value);
  };

  /**
   * Trigger file input click.
   */
  const handleAddConversationClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file selection and upload with progress tracking.
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Generate temporary ID for tracking
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Notify parent that upload is starting
    onUploadStart?.(file.name, tempId);

    try {
      // Upload with progress tracking
      const call = await uploadAudio(file, (progress) => {
        onUploadProgress?.(tempId, progress);
      });

      // Success - replace temp entry with real data
      onUploadComplete?.(tempId, call);
      message.success(`"${file.name}" uploaded successfully`);
    } catch (error) {
      // Remove temp entry on error
      onUploadError?.(tempId);
      message.error(getErrorMessage(error));
    } finally {
      // Reset file input
      event.target.value = "";
    }
  };

  return (
    <Row className="justify-content-end" gutter={12}>
      <Col className="d-flex justify-content-end align-items-center">
        <Select
          placeholder="Filter by status"
          allowClear
          options={statusOptions}
          style={{ width: 160 }}
          value={statusFilter}
          onChange={(value) =>
            handleStatusChange(value as CallStatus | undefined)
          }
        />
      </Col>

      <Col className="text-end">
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleAddConversationClick}
          className="upload-btn"
        >
          Upload Recording
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </Col>
    </Row>
  );
};

export default Filter;
