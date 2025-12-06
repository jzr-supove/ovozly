/**
 * Calls Page Component
 *
 * Displays a paginated table of call recordings with filtering
 * and audio upload functionality.
 */

import { Card, Col, Row, Table, Tag } from "antd";
import type { TableProps } from "antd";
import { Link } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";

import { CallRecord, CallStatus } from "./types/callsTypes";
import { fetchCalls } from "@/services/calls.service";
import { getErrorMessage } from "@/services/api";
import Filter from "./components/filter/Filter";
import TableSkeleton, {
  SkeletonTableColumnsType,
} from "./components/skeleton/TableSkeleton";
import TablePagination from "./components/pagination/TablePagination";
import { formatCreatedAt, formatDuration } from "@/utils/helpers";

import "./calls.scss";

/** Status color mapping */
const STATUS_COLORS: Record<CallStatus, string> = {
  [CallStatus.SUCCESS]: "green",
  [CallStatus.RUNNING]: "blue",
  [CallStatus.FAILED]: "red",
  [CallStatus.PENDING]: "orange",
};

/** Table column definitions */
const columns: TableProps<CallRecord>["columns"] = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: "300px",
  },
  {
    title: "Agent ID",
    dataIndex: "agent_id",
    key: "agent_id",
    width: "300px",
  },
  {
    title: "Call Duration",
    dataIndex: "call_duration",
    key: "call_duration",
    render: (duration: number) => formatDuration(duration),
    width: "200px",
  },
  {
    title: "Created At",
    dataIndex: "created_at",
    key: "created_at",
    render: (dateString: string) => formatCreatedAt(dateString),
    width: "200px",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: "150px",
    render: (status: CallStatus) => (
      <Tag color={STATUS_COLORS[status] || "default"} className="text-capitalize">
        {status.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: "View",
    key: "action",
    align: "end",
    width: "80px",
    render: (_, record) => (
      <Link
        to={`${record.celery_task_id}`}
        state={{
          created_at: record.created_at,
          call_duration: record.call_duration,
          file_id: record.file_id,
        }}
        className="view-call btn btn-sm btn-icon"
      >
        <ArrowRightOutlined style={{ color: "#8c8c8c", fontSize: 12 }} />
      </Link>
    ),
  },
];

const Calls = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load calls from the API.
   */
  const loadCalls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCalls();
      setCalls(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  /**
   * Callback to refresh data after successful upload.
   */
  const handleUploadSuccess = useCallback(() => {
    loadCalls();
  }, [loadCalls]);

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
        <Card className="w-100 h-100">
          <Row className="h-100">
            <Col span={24}>
              <Row>
                <Col span={12}>
                  <h3>Calls</h3>
                </Col>
                <Col span={12}>
                  <Filter onUploadSuccess={handleUploadSuccess} />
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
                  scroll={{ y: "calc(100vh - 400px)" }}
                />
              </TableSkeleton>
            </Col>

            <Col span={24}>
              <TablePagination total={calls.length} pageSize={10} />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default Calls;
