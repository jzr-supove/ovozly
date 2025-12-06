/**
 * Filter Component
 *
 * Provides status filtering and audio upload functionality for the calls list.
 */

import { Col, Row, Select, Button, message } from "antd";
import { useRef, useState } from "react";
import { SelectProps } from "antd/es/select";

import { CallStatus } from "../../types/callsTypes";
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
  /** Callback fired after successful audio upload */
  onUploadSuccess?: () => void;
}

const Filter: React.FC<FilterProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<CallStatus | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Handle status filter change.
   */
  const handleStatusChange = (value: CallStatus | undefined) => {
    setSelectedStatus(value);
    // TODO: Implement filtering logic when backend supports it
  };

  /**
   * Trigger file input click.
   */
  const handleAddConversationClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file selection and upload.
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadAudio(file);
      message.success("Audio uploaded successfully");
      onUploadSuccess?.();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Row className="justify-content-end" gutter={8}>
      <Col
        span={7}
        className="d-flex justify-content-end align-items-center me-2"
      >
        <Select
          placeholder="Status"
          allowClear
          options={statusOptions}
          style={{ width: 200 }}
          value={selectedStatus}
          onChange={(value) =>
            handleStatusChange(value as CallStatus | undefined)
          }
        />
      </Col>

      <Col span={6} className="text-end">
        <Button
          type="primary"
          onClick={handleAddConversationClick}
          loading={isUploading}
        >
          Add conversation
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
