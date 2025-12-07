/**
 * SpeechAnalysis Component
 *
 * Displays speech analysis results including sentiment, entities,
 * intents, transcript (chat-like), and identified issues.
 */

import React from "react";
import { Card, Col, Row } from "antd";
import { SmileOutlined, UserOutlined } from "@ant-design/icons";
import { capitalize } from "@/utils/helpers";
import { DiarizationSegment } from "@/pages/calls/types/callsTypes";
import ChatTranscript from "./ChatTranscript";

export interface SpeechAnalysisType {
  transcript: string;
  intent_detection: Array<{
    intent: string;
    confidence_score: number;
  }>;
  sentiment_analysis: {
    customer_sentiment: string;
    agent_sentiment: string;
  };
  entities_extracted: Array<{
    entity_type: string;
    value: string;
    confidence_score: number;
  }>;
  issues_identified: Array<{
    issue_type: string;
    description: string;
  }>;
}

interface SpeechAnalysisProps {
  speechAnalysis: SpeechAnalysisType | undefined;
  /** Raw diarization segments for chat-like transcript display */
  diarizationSegments?: DiarizationSegment[] | null;
  /** Current audio playback time in seconds */
  currentTime?: number;
  /** Callback when user clicks on a transcript segment */
  onSegmentClick?: (startTime: number) => void;
}

/**
 * Format confidence score as percentage
 */
const formatConfidence = (score: number): string => {
  // If score is already 0-1, multiply by 100
  const percentage = score <= 1 ? score * 100 : score;
  return `${Math.round(percentage)}%`;
};

const SpeechAnalysis: React.FC<SpeechAnalysisProps> = ({
  speechAnalysis,
  diarizationSegments,
  currentTime = 0,
  onSegmentClick,
}) => {
  // Use diarization segments if available, otherwise fall back to plain transcript
  const hasDiarization = diarizationSegments && diarizationSegments.length > 0;

  return (
    <Row gutter={[24, 24]} className="speech-analysis">
      {/* First Row: Sentiment, Entities, Intent */}
      <Col xs={24} md={6}>
        <Card className="analysis-section-card h-100">
          <h4 className="section-title">Sentiment Analysis</h4>
          <div className="sentiment-grid">
            <div className="sentiment-item">
              <div className="sentiment-icon customer">
                <UserOutlined />
              </div>
              <div className="sentiment-content">
                <span className="sentiment-label">Customer</span>
                <span className="sentiment-value">
                  {speechAnalysis
                    ? capitalize(speechAnalysis.sentiment_analysis.customer_sentiment)
                    : "—"}
                </span>
              </div>
            </div>
            <div className="sentiment-item">
              <div className="sentiment-icon agent">
                <SmileOutlined />
              </div>
              <div className="sentiment-content">
                <span className="sentiment-label">Agent</span>
                <span className="sentiment-value">
                  {speechAnalysis
                    ? capitalize(speechAnalysis.sentiment_analysis.agent_sentiment)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={9}>
        <Card className="analysis-section-card h-100">
          <h4 className="section-title">Entities Extracted</h4>
          <div className="entities-list">
            {speechAnalysis?.entities_extracted.map((item, index) => (
              <div className="entity-item" key={index}>
                <div className="entity-info">
                  <span className="entity-value">{capitalize(item.value)}</span>
                  <span className="entity-type">{capitalize(item.entity_type)}</span>
                </div>
                <div className="confidence-badge">
                  {formatConfidence(item.confidence_score)}
                </div>
              </div>
            ))}
            {(!speechAnalysis?.entities_extracted ||
              speechAnalysis.entities_extracted.length === 0) && (
              <div className="empty-state">No entities extracted</div>
            )}
          </div>
        </Card>
      </Col>

      <Col xs={24} md={9}>
        <Card className="analysis-section-card h-100">
          <h4 className="section-title">Intent Detection</h4>
          <div className="intent-list">
            {speechAnalysis?.intent_detection.map((item, index) => (
              <div className="intent-item" key={index}>
                <div className="intent-info">
                  <span className="intent-value">{capitalize(item.intent)}</span>
                  <span className="intent-label">Intent</span>
                </div>
                <div className="confidence-badge">
                  {formatConfidence(item.confidence_score)}
                </div>
              </div>
            ))}
            {(!speechAnalysis?.intent_detection ||
              speechAnalysis.intent_detection.length === 0) && (
              <div className="empty-state">No intents detected</div>
            )}
          </div>
        </Card>
      </Col>

      {/* Second Row: Transcript and Issues */}
      <Col xs={24} md={16}>
        <Card className="analysis-section-card transcript-card">
          <h4 className="section-title">
            Transcript
            {hasDiarization && (
              <span className="section-subtitle">Click on a message to play from that point</span>
            )}
          </h4>
          {hasDiarization ? (
            <ChatTranscript
              segments={diarizationSegments}
              currentTime={currentTime}
              onSegmentClick={onSegmentClick}
            />
          ) : (
            <div className="transcript-content">
              <pre>{speechAnalysis?.transcript || "No transcript available"}</pre>
            </div>
          )}
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card className="analysis-section-card h-100">
          <h4 className="section-title">Issues Identified</h4>
          <div className="issues-list">
            {speechAnalysis?.issues_identified.map((item, index) => (
              <div className="issue-item" key={index}>
                <span className="issue-indicator" />
                <div className="issue-content">
                  <span className="issue-type">{capitalize(item.issue_type)}</span>
                  <span className="issue-description">{item.description}</span>
                </div>
              </div>
            ))}
            {(!speechAnalysis?.issues_identified ||
              speechAnalysis.issues_identified.length === 0) && (
              <div className="empty-state">No issues identified</div>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default SpeechAnalysis;
