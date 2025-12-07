import { Card, Row, Col, Tag } from "antd";

import {
  SmileOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { capitalize } from "@/utils/helpers";

export interface SummaryAnalysisType {
  key_points: string[];
  overall_sentiment: string;
  call_efficiency: string;
  resolution_status: string;
}

interface SummaryAnalysisProps {
  summaryAnalysis: SummaryAnalysisType | undefined;
}

/**
 * Get color for sentiment/efficiency/status
 */
const getStatusColor = (value: string): string => {
  const lowerValue = value?.toLowerCase() || "";
  if (lowerValue.includes("positive") || lowerValue.includes("high") || lowerValue.includes("resolved")) {
    return "green";
  }
  if (lowerValue.includes("negative") || lowerValue.includes("low") || lowerValue.includes("unresolved")) {
    return "red";
  }
  if (lowerValue.includes("neutral") || lowerValue.includes("medium") || lowerValue.includes("partial")) {
    return "orange";
  }
  return "blue";
};

const SummaryAnalysis: React.FC<SummaryAnalysisProps> = ({
  summaryAnalysis,
}) => {
  return (
    <div className="summary-analysis">
      {/* Top Stats Row */}
      <Row gutter={[24, 24]} className="summary-stats">
        <Col xs={24} md={8}>
          <Card className="stat-card">
            <div className="stat-header">
              <div className="stat-icon sentiment">
                <SmileOutlined />
              </div>
              <span className="stat-label">Overall Sentiment</span>
            </div>
            <div className="stat-value">
              <Tag color={getStatusColor(summaryAnalysis?.overall_sentiment || "")}>
                {summaryAnalysis ? capitalize(summaryAnalysis.overall_sentiment) : "—"}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="stat-card">
            <div className="stat-header">
              <div className="stat-icon efficiency">
                <ThunderboltOutlined />
              </div>
              <span className="stat-label">Call Efficiency</span>
            </div>
            <div className="stat-value">
              <Tag color={getStatusColor(summaryAnalysis?.call_efficiency || "")}>
                {summaryAnalysis ? capitalize(summaryAnalysis.call_efficiency) : "—"}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="stat-card">
            <div className="stat-header">
              <div className="stat-icon resolution">
                <CheckCircleOutlined />
              </div>
              <span className="stat-label">Resolution Status</span>
            </div>
            <div className="stat-value">
              <Tag color={getStatusColor(summaryAnalysis?.resolution_status || "")}>
                {summaryAnalysis ? capitalize(summaryAnalysis.resolution_status) : "—"}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Key Points */}
      <Card className="key-points-card">
        <h4 className="key-points-title">
          <BulbOutlined className="title-icon" />
          Key Points
        </h4>
        <div className="key-points-list">
          {summaryAnalysis?.key_points.map((item, index) => (
            <div className="key-point-item" key={index}>
              <span className="point-number">{index + 1}</span>
              <p className="point-text">{item}</p>
            </div>
          ))}
          {(!summaryAnalysis?.key_points || summaryAnalysis.key_points.length === 0) && (
            <div className="empty-state">No key points available</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SummaryAnalysis;
