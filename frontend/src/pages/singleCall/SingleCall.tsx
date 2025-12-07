/**
 * Single Call Page Component
 *
 * Displays detailed analysis of a specific call recording including
 * speech analysis, summary, and recommendations with sleek design and animations.
 */

import {
  Button,
  Card,
  Col,
  Row,
  Tabs,
  Spin,
  Tag,
  Modal,
  message,
  Tooltip,
} from "antd";
import {
  ClockCircleOutlined,
  GlobalOutlined,
  HourglassOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  DownloadOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";

import {
  getTaskStatus,
  TaskStatusResponse,
  deleteCall,
} from "@/services/calls.service";
import { getErrorMessage } from "@/services/api";
import SpeechAnalysis, { SpeechAnalysisType } from "./components/SpeechAnalysis";
import Recommendations, { ActionRecommendation } from "./components/Recommendations";
import SummaryAnalysis, { SummaryAnalysisType } from "./components/SummaryAnalysis";
import AudioPlayer from "../calls/components/audioPlayer";
import { formatDateShort, formatTimeShort, formatDuration, capitalize } from "@/utils/helpers";

import "./singleCall.scss";

/** Tab content keys */
type TabKey = "speech_analysis" | "summary_analysis" | "recommendations";

/** Polling interval for RUNNING status (ms) */
const STATUS_POLL_INTERVAL = 1000;

/** Status type */
type TaskStatus = "SUCCESS" | "RUNNING" | "FAILED" | "PENDING";

/** Status configuration */
const STATUS_CONFIG: Record<
  TaskStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  SUCCESS: {
    color: "green",
    icon: <CheckCircleOutlined />,
    label: "Completed",
  },
  RUNNING: {
    color: "blue",
    icon: <SyncOutlined spin />,
    label: "Processing",
  },
  FAILED: {
    color: "red",
    icon: <ExclamationCircleOutlined />,
    label: "Failed",
  },
  PENDING: {
    color: "orange",
    icon: <ClockCircleOutlined />,
    label: "Pending",
  },
};

const SingleCall = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { created_at, call_duration, file_id } = location.state || {};

  const [activeTab, setActiveTab] = useState<TabKey>("speech_analysis");
  const [taskStatus, setTaskStatus] = useState<TaskStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derived state from task status
  const currentStatus = (taskStatus?.status as TaskStatus) || "PENDING";
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;
  const actionRecommendations = taskStatus?.result?.action_recommendations as
    | ActionRecommendation[]
    | undefined;
  const summaryAnalysis = taskStatus?.result?.summary_analysis as
    | SummaryAnalysisType
    | undefined;
  const speechAnalysis = taskStatus?.result?.speech_analysis as
    | SpeechAnalysisType
    | undefined;

  /**
   * Navigate back to the calls list.
   */
  const onBackClick = () => {
    navigate("/calls");
  };

  /**
   * Handle tab change.
   */
  const onTabChange = (activeKey: string) => {
    setActiveTab(activeKey as TabKey);
  };

  /**
   * Fetch task status from API.
   */
  const fetchStatus = useCallback(
    async (showLoading = true) => {
      if (!callId) return;

      try {
        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);
        const data = await getTaskStatus(callId);
        setTaskStatus(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [callId]
  );

  /**
   * Download the audio file.
   */
  const handleDownloadAudioClick = () => {
    if (!file_id) return;

    setIsDownloading(true);
    const link = document.createElement("a");
    link.href = file_id;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 500);
  };

  /**
   * Handle delete confirmation.
   */
  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  /**
   * Delete the call and navigate back.
   */
  const handleDeleteConfirm = async () => {
    if (!callId) return;

    try {
      setIsDeleting(true);
      await deleteCall(callId);
      message.success("Call deleted successfully");
      navigate("/calls");
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Set up polling for RUNNING status
  useEffect(() => {
    const shouldPoll =
      currentStatus === "RUNNING" || currentStatus === "PENDING";

    if (shouldPoll && !isLoading) {
      pollIntervalRef.current = setInterval(() => {
        fetchStatus(false);
      }, STATUS_POLL_INTERVAL);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [currentStatus, isLoading, fetchStatus]);

  /** Tab items */
  const tabItems = [
    {
      label: (
        <span className="tab-label">
          <span className="tab-icon">📊</span>
          Speech Analysis
        </span>
      ),
      key: "speech_analysis",
    },
    {
      label: (
        <span className="tab-label">
          <span className="tab-icon">📝</span>
          Summary
        </span>
      ),
      key: "summary_analysis",
    },
    {
      label: (
        <span className="tab-label">
          <span className="tab-icon">💡</span>
          Recommendations
        </span>
      ),
      key: "recommendations",
    },
  ];

  /** Tab content mapping */
  const tabContent: Record<TabKey, JSX.Element> = {
    speech_analysis: <SpeechAnalysis speechAnalysis={speechAnalysis} />,
    summary_analysis: <SummaryAnalysis summaryAnalysis={summaryAnalysis} />,
    recommendations: (
      <Recommendations actionRecommendations={actionRecommendations} />
    ),
  };

  if (isLoading) {
    return (
      <div className="single-call-loading">
        <div className="loading-content">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          />
          <h3>Loading call details...</h3>
          <p>Please wait while we fetch the analysis data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="single-call-page">
        <div className="page-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBackClick}
            className="back-btn"
          >
            Back to Calls
          </Button>
        </div>
        <Card className="error-card">
          <ExclamationCircleOutlined className="error-icon" />
          <h3>Error Loading Call</h3>
          <p>{error}</p>
          <Button type="primary" onClick={() => fetchStatus()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="single-call-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBackClick}
            className="back-btn"
          >
            Back to Calls
          </Button>
          <h1 className="page-title">Call Analysis</h1>
        </div>
        <div className="header-actions">
          <Tooltip title="Download audio file">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadAudioClick}
              loading={isDownloading}
              disabled={!file_id}
            >
              Download
            </Button>
          </Tooltip>
          <Tooltip title="Delete this call">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Top Row - Audio Recording & Call Details side by side */}
      <Row gutter={[24, 24]} className="single-call-content">
        <Col xs={24} lg={14}>
          <Card className="audio-card animate-fade-in">
            <h3 className="card-title">
              <span className="title-icon">🎧</span>
              Audio Recording
            </h3>
            {file_id ? (
              <AudioPlayer audioUrl={file_id} />
            ) : (
              <div className="no-audio">
                <p>Audio file not available</p>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card className="metadata-card animate-fade-in delay-1">
            <div className="metadata-header">
              <h3 className="card-title">
                <span className="title-icon">📋</span>
                Call Details
              </h3>
              <Tag
                color={statusConfig.color}
                icon={statusConfig.icon}
                className="status-tag-header"
              >
                {statusConfig.label}
              </Tag>
            </div>
            <div className="metadata-list">
              <div className="metadata-row">
                <div className="metadata-icon">
                  <HourglassOutlined />
                </div>
                <div className="metadata-info">
                  <span className="metadata-label">Duration</span>
                  <span className="metadata-value">
                    {formatDuration(call_duration)}
                  </span>
                </div>
              </div>

              <div className="metadata-row">
                <div className="metadata-icon">
                  <ClockCircleOutlined />
                </div>
                <div className="metadata-info">
                  <span className="metadata-label">Date</span>
                  <span className="metadata-value">
                    {formatDateShort(created_at)}
                  </span>
                </div>
                <span className="metadata-secondary">
                  {formatTimeShort(created_at)}
                </span>
              </div>

              <div className="metadata-row">
                <div className="metadata-icon">
                  <GlobalOutlined />
                </div>
                <div className="metadata-info">
                  <span className="metadata-label">Language</span>
                  <span className="metadata-value">
                    {taskStatus?.result?.call_metadata?.language
                      ? capitalize(taskStatus.result.call_metadata.language)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Analysis Section - Full Width Below */}
        <Col span={24}>
          <Card className="analysis-card animate-fade-in delay-2">
            {currentStatus === "SUCCESS" ? (
              <>
                <Tabs
                  activeKey={activeTab}
                  items={tabItems}
                  onChange={onTabChange}
                  className="analysis-tabs"
                />
                <div className="tab-content">{tabContent[activeTab]}</div>
              </>
            ) : (
              <div className="processing-state">
                {currentStatus === "RUNNING" || currentStatus === "PENDING" ? (
                  <>
                    <div className="processing-animation">
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 64 }} spin />
                        }
                      />
                    </div>
                    <h3>Processing Your Call</h3>
                    <p>
                      {taskStatus?.result?.detail ||
                        "AI is analyzing the conversation..."}
                    </p>
                    <div className="processing-steps">
                      <div className="step active">
                        <span className="step-dot" />
                        <span>Transcribing audio</span>
                      </div>
                      <div className="step">
                        <span className="step-dot" />
                        <span>Analyzing sentiment</span>
                      </div>
                      <div className="step">
                        <span className="step-dot" />
                        <span>Generating insights</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <ExclamationCircleOutlined className="failed-icon" />
                    <h3>Processing Failed</h3>
                    <p>
                      {taskStatus?.result?.detail ||
                        "An error occurred while processing the call."}
                    </p>
                    <Button type="primary" onClick={() => navigate("/calls")}>
                      Back to Calls
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Call Recording"
        open={deleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
        okText="Delete"
        okButtonProps={{ danger: true, loading: isDeleting }}
        cancelButtonProps={{ disabled: isDeleting }}
      >
        <p>
          Are you sure you want to delete this call recording? This action
          cannot be undone and will permanently remove:
        </p>
        <ul>
          <li>The audio file</li>
          <li>All analysis data</li>
          <li>Transcripts and recommendations</li>
        </ul>
      </Modal>
    </div>
  );
};

export default SingleCall;
