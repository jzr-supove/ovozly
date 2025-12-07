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
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";

import {
  fetchCallDetails,
  deleteCall,
} from "@/services/calls.service";
import { getErrorMessage } from "@/services/api";
import { CallWithAnalysis, CallStatus } from "@/pages/calls/types/callsTypes";
import SpeechAnalysis from "./components/SpeechAnalysis";
import Recommendations from "./components/Recommendations";
import SummaryAnalysis from "./components/SummaryAnalysis";
import AudioPlayer from "../calls/components/audioPlayer";
import {
  formatDateShort,
  formatTimeShort,
  formatDuration,
  capitalize,
} from "@/utils/helpers";

import "./singleCall.scss";

/** Tab content keys */
type TabKey = "speech_analysis" | "summary_analysis" | "recommendations";

/** Polling interval for RUNNING status (ms) */
const STATUS_POLL_INTERVAL = 2000;

/** Status configuration */
const STATUS_CONFIG: Record<
  CallStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  [CallStatus.SUCCESS]: {
    color: "green",
    icon: <CheckCircleOutlined />,
    label: "Completed",
  },
  [CallStatus.RUNNING]: {
    color: "blue",
    icon: <SyncOutlined spin />,
    label: "Processing",
  },
  [CallStatus.FAILED]: {
    color: "red",
    icon: <ExclamationCircleOutlined />,
    label: "Failed",
  },
  [CallStatus.PENDING]: {
    color: "orange",
    icon: <ClockCircleOutlined />,
    label: "Pending",
  },
};

const SingleCall = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>("speech_analysis");
  const [callData, setCallData] = useState<CallWithAnalysis | null>(null);
  const [currentStatus, setCurrentStatus] = useState<CallStatus>(
    CallStatus.PENDING
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derived state
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;
  const speechAnalysis = callData?.speech_analysis;

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
   * Fetch call details from database.
   */
  const loadCallData = useCallback(async () => {
    if (!callId) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchCallDetails(callId);
      setCallData(data);
      setCurrentStatus(data.status);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [callId]);

  /**
   * Poll for updates when status is RUNNING/PENDING.
   */
  const pollForUpdates = useCallback(async () => {
    if (!callId) return;

    try {
      const data = await fetchCallDetails(callId);
      setCallData(data);
      setCurrentStatus(data.status);

      // Stop polling if complete or failed
      if (data.status === CallStatus.SUCCESS || data.status === CallStatus.FAILED) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (err) {
      console.error("Error polling for updates:", err);
    }
  }, [callId]);

  /**
   * Download the audio file.
   */
  const handleDownloadAudioClick = () => {
    if (!callData?.file_id) return;

    setIsDownloading(true);
    const link = document.createElement("a");
    link.href = callData.file_id;
    link.download = callData.file_name || "audio";
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
    loadCallData();
  }, [loadCallData]);

  // Set up polling for RUNNING/PENDING status
  useEffect(() => {
    const shouldPoll =
      !isLoading &&
      (currentStatus === CallStatus.RUNNING ||
        currentStatus === CallStatus.PENDING);

    if (shouldPoll) {
      pollIntervalRef.current = setInterval(pollForUpdates, STATUS_POLL_INTERVAL);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [currentStatus, isLoading, pollForUpdates]);

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

  /** Render tab content based on active tab */
  const renderTabContent = () => {
    if (!speechAnalysis) return null;

    switch (activeTab) {
      case "speech_analysis":
        return (
          <SpeechAnalysis
            speechAnalysis={{
              transcript: speechAnalysis.transcript,
              intent_detection: speechAnalysis.intents.map((i) => ({
                intent: i.intent,
                confidence_score: i.confidence_score || 0,
              })),
              sentiment_analysis: {
                customer_sentiment: speechAnalysis.customer_sentiment || "",
                agent_sentiment: speechAnalysis.agent_sentiment || "",
              },
              entities_extracted: speechAnalysis.extracted_entities.map((e) => ({
                entity_type: e.entity_type,
                value: e.value,
                confidence_score: e.confidence_score || 0,
              })),
              issues_identified: speechAnalysis.issues.map((i) => ({
                issue_type: i.issue_type,
                description: i.description,
              })),
            }}
          />
        );
      case "summary_analysis":
        return (
          <SummaryAnalysis
            summaryAnalysis={{
              key_points: speechAnalysis.keypoints.map((k) => k.point),
              overall_sentiment: speechAnalysis.overall_sentiment || "",
              call_efficiency: speechAnalysis.call_efficiency || "",
              resolution_status: speechAnalysis.resolution_status || "",
            }}
          />
        );
      case "recommendations":
        return (
          <Recommendations
            actionRecommendations={speechAnalysis.actions.map((a) => ({
              action_type: a.action_type,
              details: a.details,
            }))}
          />
        );
      default:
        return null;
    }
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
          <Button type="primary" onClick={() => loadCallData()}>
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
              disabled={!callData?.file_id}
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
            {callData?.file_id ? (
              <AudioPlayer audioUrl={callData.file_id} />
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
                    {callData?.call_duration
                      ? formatDuration(callData.call_duration)
                      : "—"}
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
                    {callData?.created_at
                      ? formatDateShort(callData.created_at)
                      : "—"}
                  </span>
                </div>
                <span className="metadata-secondary">
                  {callData?.created_at
                    ? formatTimeShort(callData.created_at)
                    : ""}
                </span>
              </div>

              <div className="metadata-row">
                <div className="metadata-icon">
                  <GlobalOutlined />
                </div>
                <div className="metadata-info">
                  <span className="metadata-label">Language</span>
                  <span className="metadata-value">
                    {speechAnalysis?.language
                      ? capitalize(speechAnalysis.language)
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
            {currentStatus === CallStatus.SUCCESS && speechAnalysis ? (
              <>
                <Tabs
                  activeKey={activeTab}
                  items={tabItems}
                  onChange={onTabChange}
                  className="analysis-tabs"
                />
                <div className="tab-content">{renderTabContent()}</div>
              </>
            ) : (
              <div className="processing-state">
                {currentStatus === CallStatus.RUNNING ||
                currentStatus === CallStatus.PENDING ? (
                  <>
                    <div className="processing-animation">
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 64 }} spin />
                        }
                      />
                    </div>
                    <h3>Processing Your Call</h3>
                    <p>AI is analyzing the conversation...</p>
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
                    <p>An error occurred while processing the call.</p>
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
