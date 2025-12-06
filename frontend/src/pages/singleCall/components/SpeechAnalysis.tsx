import React from "react";

import { Card, Col, Row } from "antd";
import { DashboardOutlined, PhoneOutlined } from "@ant-design/icons";
import { ToolOutlined } from "@ant-design/icons";
import { capitalize } from "@/utils/helpers";

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

interface RecommendationsProps {
  speechAnalysis: SpeechAnalysisType | undefined;
}

const SpeechAnalysis: React.FC<RecommendationsProps> = ({ speechAnalysis }) => {
  return (
    <Row gutter={[24, 24]} className="speech-analysis">
      <Col span={6}>
        <Card className="h-100">
          <h4
            className="d-flex align-items-start flex-column mb-4"
            style={{ fontSize: "18px", fontWeight: "500" }}
          >
            Sentiment Analysis
          </h4>
          <Row gutter={[16, 16]}>
            <Col span={24} className="px-0">
              <div className="py-3 px-4 me-6 mb-3 call-card flex-grow-1">
                <div className="d-flex align-items-center">
                  <PhoneOutlined className="call-card__icon me-2" />
                  <div className="call-card__title">
                    {speechAnalysis &&
                      capitalize(
                        speechAnalysis.sentiment_analysis.customer_sentiment
                      )}
                  </div>
                </div>
                <div className="call-card__subtitle">Customer Sentiment</div>
              </div>
            </Col>
            <Col span={24} className="px-0">
              <div className="py-3 px-4 me-6 mb-3 call-card flex-grow-1">
                <div className="d-flex align-items-center">
                  <DashboardOutlined className="call-card__icon me-2" />
                  <div className="call-card__title">
                    {speechAnalysis &&
                      capitalize(
                        speechAnalysis.sentiment_analysis.agent_sentiment
                      )}
                  </div>
                </div>
                <div className="call-card__subtitle">Agent Sentiment</div>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={10}>
        <Card className="entities-extracted-card h-100">
          <h4
            className="d-flex align-items-start flex-column mb-4"
            style={{ fontSize: "18px", fontWeight: "500" }}
          >
            Entities extracted
          </h4>

          {speechAnalysis?.entities_extracted.map((item, index) => (
            <div className="" key={index}>
              <div className="d-flex justify-content-between">
                <div className="d-flex align-items-center me-5">
                  <div className="me-5">
                    <span
                      className="fs-6"
                      style={{
                        color: "#252F4A",
                        fontWeight: "600",
                      }}
                    >
                      {capitalize(item.value)}
                    </span>

                    <span
                      className="d-block"
                      style={{ fontWeight: "500", color: "#99A1B7" }}
                    >
                      {capitalize(item.entity_type)}
                    </span>
                  </div>
                </div>

                <div
                  className="text-end"
                  style={{ fontWeight: "500", color: "#99A1B7" }}
                >
                  <span
                    className="fs-6 d-block"
                    style={{
                      color: "#252F4A",
                      fontWeight: "600",
                    }}
                  >
                    {item.confidence_score}
                  </span>
                  Confidence score
                </div>
              </div>

              {index === speechAnalysis?.entities_extracted.length - 1 ? (
                ""
              ) : (
                <div className="separator my-3"></div>
              )}
            </div>
          ))}
        </Card>
      </Col>
      <Col span={8}>
        <Card className="entities-extracted-card h-100">
          <h4
            className="d-flex align-items-start flex-column mb-4"
            style={{ fontSize: "18px", fontWeight: "500" }}
          >
            Intent Detection
          </h4>

          {speechAnalysis?.intent_detection.map((item, index) => (
            <div className="" key={index}>
              <div className="d-flex justify-content-between">
                <div className="d-flex align-items-center me-5">
                  <div className="me-5">
                    <span
                      className="fs-6"
                      style={{
                        color: "#252F4A",
                        fontWeight: "600",
                      }}
                    >
                      {capitalize(item.intent)}
                    </span>

                    <span
                      className="d-block"
                      style={{ fontWeight: "500", color: "#99A1B7" }}
                    >
                      Intent
                    </span>
                  </div>
                </div>

                <div
                  className="text-end"
                  style={{ fontWeight: "500", color: "#99A1B7" }}
                >
                  <span
                    className="fs-6 d-block"
                    style={{
                      color: "#252F4A",
                      fontWeight: "600",
                    }}
                  >
                    {item.confidence_score}
                  </span>
                  Confidence score
                </div>
              </div>

              {index === speechAnalysis?.entities_extracted.length - 1 ? (
                ""
              ) : (
                <div className="separator my-3"></div>
              )}
            </div>
          ))}
        </Card>
      </Col>
      <Col span={16}>
        <Card style={{ maxHeight: "500px", overflowY: "auto" }}>
          <h4
            className="d-flex align-items-start flex-column"
            style={{ fontSize: "18px", fontWeight: "500" }}
          >
            Transcript
          </h4>
          <div>
            <pre>{speechAnalysis?.transcript}</pre>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card className="h-100">
          <h4
            className="d-flex align-items-start flex-column mb-4"
            style={{ fontSize: "18px", fontWeight: "500" }}
          >
            Issues Identified
          </h4>
          {speechAnalysis?.issues_identified.map((item) => (
            <div
              className="d-flex mb-2 justify-content-start align-items-start"
              key={item.issue_type}
            >
              <span
                className="bullet bullet-vertical h-40px bg-success me-2"
                style={{ height: "50px" }}
              ></span>

              <div className="d-flex flex-column">
                <div className="d-flex align-items-center mb-1">
                  <h5
                    className="text-hover-primary me-3 fw-semibold mb-0"
                    style={{ fontSize: "1.1rem", fontWeight: "500" }}
                  >
                    {capitalize(item.issue_type)}
                  </h5>
                </div>
                <span className="text-muted fw-semibold fs-6">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </Card>
      </Col>
    </Row>
  );
};

export default SpeechAnalysis;
