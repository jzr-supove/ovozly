/**
 * Single Call Page Component
 *
 * Displays detailed analysis of a specific call recording including
 * speech analysis, summary, and recommendations.
 */

import { Button, Card, Col, Flex, Row, Tabs, Spin } from "antd";
import {
  ClockCircleOutlined,
  GlobalOutlined,
  HourglassOutlined,
  LeftCircleOutlined,
  PhoneOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import { getTaskStatus, TaskStatusResponse } from "@/services/calls.service";
import { getErrorMessage } from "@/services/api";
import SpeechAnalysis, { SpeechAnalysisType } from "./components/SpeechAnalysis";
import Recommendations, { ActionRecommendation } from "./components/Recommendations";
import SummaryAnalysis, { SummaryAnalysisType } from "./components/SummaryAnalysis";
import { formatCreatedAt, formatDuration, capitalize } from "@/utils/helpers";

import "./singleCall.scss";

/** Tab content keys */
type TabKey = "speech_analysis" | "summary_analysis" | "recommendations";

const SingleCall = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { created_at, call_duration, file_id } = location.state || {};

  const [activeTab, setActiveTab] = useState<TabKey>("speech_analysis");
  const [taskStatus, setTaskStatus] = useState<TaskStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state from task status
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
    navigate(-1);
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
  const fetchStatus = useCallback(async () => {
    if (!callId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getTaskStatus(callId);
      setTaskStatus(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [callId]);

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
    setIsDownloading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  /** Tab content mapping */
  const tabContent: Record<TabKey, JSX.Element> = {
    speech_analysis: <SpeechAnalysis speechAnalysis={speechAnalysis} />,
    summary_analysis: <SummaryAnalysis summaryAnalysis={summaryAnalysis} />,
    recommendations: <Recommendations actionRecommendations={actionRecommendations} />,
  };

  if (isLoading) {
    return (
      <Row justify="center" align="middle" className="h-100">
        <Spin size="large" tip="Loading call details..." />
      </Row>
    );
  }

  if (error) {
    return (
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div className="d-flex align-items-center gap-1 page-title">
            <LeftCircleOutlined
              className="fs-4 p-2 cursor-pointer"
              onClick={onBackClick}
            />
            <h3 className="mb-0 fs-4" style={{ paddingBottom: "2px" }}>
              Conversation analysis
            </h3>
          </div>
        </Col>
        <Col span={24}>
          <Card>
            <h4>Error Loading Call</h4>
            <p className="text-muted">{error}</p>
          </Card>
        </Col>
      </Row>
    );
  }

  // Show processing status if not successful
  if (taskStatus?.status !== "SUCCESS") {
    return (
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div className="d-flex align-items-center gap-1 page-title">
            <LeftCircleOutlined
              className="fs-4 p-2 cursor-pointer"
              onClick={onBackClick}
            />
            <h3 className="mb-0 fs-4" style={{ paddingBottom: "2px" }}>
              Conversation analysis
            </h3>
          </div>
        </Col>
        <Col span={24}>
          <Card>
            <h4>Status: {taskStatus?.status}</h4>
            <p>Details: {taskStatus?.result?.detail || "Processing..."}</p>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={[24, 24]} className="single-call">
      <Col span={12}>
        <div className="d-flex align-items-center gap-1 page-title">
          <LeftCircleOutlined
            className="fs-4 p-2 cursor-pointer"
            onClick={onBackClick}
          />
          <h3 className="mb-0 fs-4" style={{ paddingBottom: "2px" }}>
            Conversation analysis
          </h3>
        </div>
      </Col>

      <Col
        span={12}
        className="text-end d-flex align-items-center justify-content-end"
      >
        <Button
          type="primary"
          onClick={handleDownloadAudioClick}
          loading={isDownloading}
          disabled={!file_id}
        >
          Download audio
        </Button>
      </Col>

      <Col span={24}>
        <Card className="single-call-info">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Flex wrap gap={24}>
                <div className="py-3 px-4 me-6 mb-2 call-card flex-grow-1">
                  <div className="d-flex align-items-center">
                    <PhoneOutlined className="call-card__icon me-2" />
                    <div className="call-card__title">{callId}</div>
                  </div>
                  <div className="call-card__subtitle">Call Id</div>
                </div>

                <div className="py-3 px-4 me-6 mb-2 call-card flex-grow-1">
                  <div className="d-flex align-items-center">
                    <GlobalOutlined className="call-card__icon me-2" />
                    <div className="call-card__title">
                      {taskStatus?.result?.call_metadata?.language
                        ? capitalize(taskStatus.result.call_metadata.language)
                        : "—"}
                    </div>
                  </div>
                  <div className="call-card__subtitle">Language</div>
                </div>

                <div className="py-3 px-4 me-6 mb-2 call-card flex-grow-1">
                  <div className="d-flex align-items-center">
                    <HourglassOutlined className="call-card__icon me-2" />
                    <div className="call-card__title">
                      {formatDuration(call_duration)}
                    </div>
                  </div>
                  <div className="call-card__subtitle">Duration</div>
                </div>

                <div className="py-3 px-4 me-6 mb-2 call-card flex-grow-1">
                  <div className="d-flex align-items-center">
                    <ClockCircleOutlined className="call-card__icon me-2" />
                    <div className="call-card__title">
                      {formatCreatedAt(created_at)}
                    </div>
                  </div>
                  <div className="call-card__subtitle">Created time</div>
                </div>

                <div className="py-3 px-4 me-6 mb-2 call-card flex-grow-1">
                  <div className="d-flex align-items-center">
                    <ExclamationCircleOutlined className="call-card__icon me-2" />
                    <div className="call-card__title">
                      {taskStatus?.status ? capitalize(taskStatus.status) : "—"}
                    </div>
                  </div>
                  <div className="call-card__subtitle">Status</div>
                </div>
              </Flex>
            </Col>

            <Col span={24}>
              <Tabs
                defaultActiveKey="speech_analysis"
                items={[
                  { label: "Speech Analysis", key: "speech_analysis" },
                  { label: "Summary Analysis", key: "summary_analysis" },
                  { label: "Recommendations", key: "recommendations" },
                ]}
                onChange={onTabChange}
                className="single-call-tab"
              />
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={24}>{tabContent[activeTab]}</Col>
    </Row>
  );
};

export default SingleCall;
