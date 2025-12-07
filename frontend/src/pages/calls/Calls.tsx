/**
 * Calls Page Component
 *
 * Displays a table of call recordings with live status updates,
 * file upload with progress tracking, and navigation to call details.
 */

import { Card, Col, Row, Table, Tag, Progress, Tooltip } from "antd";
import type { TableProps } from "antd";
import { Link } from "react-router-dom";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SoundOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useCallback, useRef } from "react";

import {
  CallRecord,
  CallStatus,
  SortField,
  SortOrder,
} from "./types/callsTypes";
import {
  fetchCalls,
  fetchCallStatuses,
  FetchCallsOptions,
} from "@/services/calls.service";
import { getErrorMessage } from "@/services/api";
import Filter from "./components/filter/Filter";
import TableSkeleton, {
  SkeletonTableColumnsType,
} from "./components/skeleton/TableSkeleton";
import { formatCreatedAt, formatDuration } from "@/utils/helpers";

import "./calls.scss";

/** Status icon mapping */
const STATUS_ICONS: Record<CallStatus, React.ReactNode> = {
  [CallStatus.SUCCESS]: <CheckCircleOutlined />,
  [CallStatus.RUNNING]: <LoadingOutlined spin />,
  [CallStatus.FAILED]: <CloseCircleOutlined />,
  [CallStatus.PENDING]: <ClockCircleOutlined />,
};

/** Status color mapping */
const STATUS_COLORS: Record<CallStatus, string> = {
  [CallStatus.SUCCESS]: "green",
  [CallStatus.RUNNING]: "blue",
  [CallStatus.FAILED]: "red",
  [CallStatus.PENDING]: "orange",
};

/** Polling interval for status updates (ms) */
const STATUS_POLL_INTERVAL = 2000;

const Calls = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CallStatus | undefined>();
  const [sortBy, setSortBy] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load calls from the API with current filters.
   */
  const loadCalls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options: FetchCallsOptions = {
        status: statusFilter,
        sortBy,
        sortOrder,
      };

      const data = await fetchCalls(options);
      setCalls(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortBy, sortOrder]);

  /**
   * Poll for status updates on pending/running calls.
   */
  const pollStatuses = useCallback(async () => {
    // Find calls that need status updates (RUNNING or PENDING)
    const pendingCalls = calls.filter(
      (call) =>
        !call.isUploading &&
        call.celery_task_id &&
        (call.status === CallStatus.RUNNING ||
          call.status === CallStatus.PENDING)
    );

    if (pendingCalls.length === 0) return;

    try {
      const taskIds = pendingCalls
        .map((call) => call.celery_task_id)
        .filter((id): id is string => id !== null);
      const statusMap = await fetchCallStatuses(taskIds);

      setCalls((prevCalls) =>
        prevCalls.map((call) => {
          if (!call.celery_task_id) return call;
          const newStatus = statusMap.get(call.celery_task_id);
          if (newStatus && newStatus !== call.status) {
            return { ...call, status: newStatus };
          }
          return call;
        })
      );
    } catch (err) {
      console.error("Error polling statuses:", err);
    }
  }, [calls]);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  // Set up polling for status updates
  useEffect(() => {
    // Check if there are any pending/running calls
    const hasPendingCalls = calls.some(
      (call) =>
        !call.isUploading &&
        (call.status === CallStatus.RUNNING ||
          call.status === CallStatus.PENDING)
    );

    if (hasPendingCalls) {
      pollIntervalRef.current = setInterval(pollStatuses, STATUS_POLL_INTERVAL);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [calls, pollStatuses]);

  /**
   * Handle status filter change.
   */
  const handleStatusFilterChange = useCallback(
    (status: CallStatus | undefined) => {
      setStatusFilter(status);
    },
    []
  );

  /**
   * Handle column sort.
   */
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortBy === field) {
        // Toggle order if same field
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        // New field, default to desc
        setSortBy(field);
        setSortOrder("desc");
      }
    },
    [sortBy, sortOrder]
  );

  /**
   * Add a new uploading call to the list.
   */
  const handleUploadStart = useCallback((fileName: string, tempId: string) => {
    const uploadingCall: CallRecord = {
      id: tempId,
      file_id: "",
      file_name: fileName,
      agent_id: "",
      call_duration: 0,
      created_at: new Date().toISOString(),
      status: CallStatus.PENDING,
      celery_task_id: "",
      isUploading: true,
      uploadProgress: 0,
    };
    setCalls((prev) => [uploadingCall, ...prev]);
  }, []);

  /**
   * Update upload progress for a call.
   */
  const handleUploadProgress = useCallback(
    (tempId: string, progress: number) => {
      setCalls((prev) =>
        prev.map((call) =>
          call.id === tempId ? { ...call, uploadProgress: progress } : call
        )
      );
    },
    []
  );

  /**
   * Replace temporary upload entry with real call data.
   */
  const handleUploadComplete = useCallback(
    (tempId: string, newCall: CallRecord) => {
      setCalls((prev) =>
        prev.map((call) =>
          call.id === tempId
            ? { ...newCall, isUploading: false, uploadProgress: 100 }
            : call
        )
      );
    },
    []
  );

  /**
   * Remove failed upload from list.
   */
  const handleUploadError = useCallback((tempId: string) => {
    setCalls((prev) => prev.filter((call) => call.id !== tempId));
  }, []);

  /**
   * Render sortable column header.
   */
  const renderSortableHeader = (title: string, field: SortField) => {
    const isActive = sortBy === field;
    return (
      <div
        className={`sortable-header ${isActive ? "active" : ""}`}
        onClick={() => handleSort(field)}
      >
        <span>{title}</span>
        <span className="sort-icons">
          <CaretUpOutlined
            className={isActive && sortOrder === "asc" ? "active" : ""}
          />
          <CaretDownOutlined
            className={isActive && sortOrder === "desc" ? "active" : ""}
          />
        </span>
      </div>
    );
  };

  /** Table column definitions */
  const columns: TableProps<CallRecord>["columns"] = [
    {
      title: renderSortableHeader("Audio File", "file_name"),
      key: "file_name",
      width: "30%",
      render: (_, record) => {
        const fileName = record.file_name || "Unknown";
        const isClickable =
          !record.isUploading &&
          (record.status === CallStatus.SUCCESS ||
            record.status === CallStatus.RUNNING);

        if (record.isUploading) {
          return (
            <div className="file-name-cell uploading">
              <div className="file-info">
                <SoundOutlined className="file-icon" />
                <span className="file-name">{fileName}</span>
              </div>
              <Progress
                percent={record.uploadProgress || 0}
                size="small"
                status="active"
                className="upload-progress"
              />
            </div>
          );
        }

        if (isClickable) {
          return (
            <Link
              to={`${record.id}`}
              className="file-name-cell clickable"
            >
              <SoundOutlined className="file-icon" />
              <span className="file-name">{fileName}</span>
            </Link>
          );
        }

        return (
          <Tooltip title="Processing failed">
            <div className="file-name-cell disabled">
              <SoundOutlined className="file-icon" />
              <span className="file-name">{fileName}</span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: renderSortableHeader("Duration", "call_duration"),
      dataIndex: "call_duration",
      key: "call_duration",
      width: "15%",
      render: (duration: number, record) => {
        if (record.isUploading) return "—";
        return formatDuration(duration);
      },
    },
    {
      title: renderSortableHeader("Date", "created_at"),
      dataIndex: "created_at",
      key: "created_at",
      width: "20%",
      render: (dateString: string) => formatCreatedAt(dateString),
    },
    {
      title: "Agent",
      dataIndex: "agent_id",
      key: "agent_id",
      width: "15%",
      render: (agentId: string, record) => {
        if (record.isUploading) return "—";
        return `Agent ${agentId}`;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (status: CallStatus, record) => {
        if (record.isUploading) {
          return (
            <Tag color="processing" className="status-tag">
              <LoadingOutlined spin className="status-icon" />
              UPLOADING
            </Tag>
          );
        }

        return (
          <Tag
            color={STATUS_COLORS[status] || "default"}
            className="status-tag"
          >
            <span className="status-icon">{STATUS_ICONS[status]}</span>
            {status}
          </Tag>
        );
      },
    },
  ];

  if (error) {
    return (
      <Row justify="center" className="w-100 h-100">
        <Col span={24}>
          <Card className="w-100">
            <div className="text-center py-4">
              <h4>Error Loading Calls</h4>
              <p className="text-muted">{error}</p>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row justify="center" className="w-100 h-100">
      <Col span={24}>
        <Card className="w-100 h-100 calls-card">
          <Row className="h-100">
            <Col span={24} className="calls-header">
              <Row align="middle">
                <Col span={12}>
                  <h3 className="calls-title">Calls</h3>
                  <span className="calls-count">{calls.length} recordings</span>
                </Col>
                <Col span={12}>
                  <Filter
                    onUploadStart={handleUploadStart}
                    onUploadProgress={handleUploadProgress}
                    onUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                    onStatusFilterChange={handleStatusFilterChange}
                    statusFilter={statusFilter}
                  />
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <TableSkeleton
                loading={loading}
                className="skeleton-custom-style"
                columns={columns as SkeletonTableColumnsType[]}
              >
                <Table<CallRecord>
                  columns={columns}
                  dataSource={calls}
                  rowKey={(record) => record.id}
                  className="calls-table"
                  pagination={false}
                  scroll={{ y: "calc(100vh - 340px)" }}
                  rowClassName={(record) =>
                    record.isUploading ? "uploading-row" : ""
                  }
                />
              </TableSkeleton>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default Calls;
