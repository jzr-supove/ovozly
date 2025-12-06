import { Card, Row, Col } from "antd";

import { DashboardOutlined, PhoneOutlined } from "@ant-design/icons";
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

const SummaryAnalysis: React.FC<SummaryAnalysisProps> = ({
  summaryAnalysis,
}) => {
  return (
    <Row gutter={[24, 24]}>
      <Col span={16}>
        <Card className="h-100">
          <h5 className="text-gray-900 text-hover-primary me-3 fw-semibold mb-4">
            Key points
          </h5>

          <div className="d-flex flex-column gap-3">
            {summaryAnalysis?.key_points.map((item, index) => (
              <div className="d-flex align-items-center mb-8 gap-3" key={index}>
                <span className="bullet bullet-vertical h-40px bg-success"></span>

                <p className="text-muted fw-semibold fs-6 mb-0">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="py-3 px-4 me-6 mb-3 call-card flex-grow-1">
                <div className="d-flex align-items-center">
                  <PhoneOutlined className="call-card__icon me-2" />
                  <div className="call-card__title">
                    {summaryAnalysis &&
                      capitalize(summaryAnalysis.overall_sentiment)}
                  </div>
                </div>
                <div className="call-card__subtitle">Overall Sentiment</div>
              </div>
            </Col>
            <Col span={24}>
              <div className="py-3 px-4 me-6 mb-3 call-card flex-grow-1">
                <div className="d-flex align-items-center">
                  <DashboardOutlined className="call-card__icon me-2" />
                  <div className="call-card__title">
                    {summaryAnalysis &&
                      capitalize(summaryAnalysis.call_efficiency)}
                  </div>
                </div>
                <div className="call-card__subtitle">Call Efficiency</div>
              </div>
            </Col>
            <Col span={24}>
              <div className="py-3 px-4 me-6 mb-3 call-card flex-grow-1">
                <div className="d-flex align-items-center">
                  <PhoneOutlined className="call-card__icon me-2" />
                  <div className="call-card__title">
                    {summaryAnalysis &&
                      capitalize(summaryAnalysis.resolution_status)}
                  </div>
                </div>
                <div className="call-card__subtitle">Resolution Status</div>
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default SummaryAnalysis;
