import { Card, Col, Flex, Row } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

interface Agent {
  name: string;
  performance: number; // performance percentage (0-100)
}

const agents: Agent[] = [
  { name: "Veronica B.", performance: 40 },
  { name: "Amirah N.", performance: 85 },
  { name: "Rodrigo G.", performance: 95 },
  { name: "Veronica B.", performance: 40 },
  { name: "Amirah N.", performance: 85 },
  { name: "Rodrigo G.", performance: 95 },
  { name: "Veronica B.", performance: 40 },
  { name: "Amirah N.", performance: 85 },
  { name: "Rodrigo G.", performance: 95 },
  { name: "Veronica B.", performance: 40 },
  { name: "Amirah N.", performance: 85 },
];
const style = {
  background: "#0092ff",
};

const Leaders = () => {
  const getPerformanceClass = (performance: number) => {
    if (performance < 80) return "low-performance";
    if (performance < 90) return "mid-performance";
    return "high-performance";
  };
  return (
    <Card
      title="Leaders & Laggers"
      extra={<EllipsisOutlined key="ellipsis" />}
      className="h-100"
    >
      <div className="chart_total">
        <span className="chart_total__main me-2">
          <span>567</span>
        </span>
        <span className="chart_total__sub">
          <span>agents</span>
        </span>
      </div>
      <div className="heatmap-container">
        <Row gutter={[8, 8]}>
          {agents.map((agent, i) => (
            <Col span={24} key={agent.name + i}>
              <Row gutter={[8, 8]}>
                <Col span={8}>
                  <div style={style} className="heatmap-item">
                    {agent.name}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={style} className="heatmap-item">
                    {agent.name}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={style} className="heatmap-item">
                    {agent.name}
                  </div>
                </Col>
              </Row>
            </Col>
          ))}
        </Row>
      </div>
    </Card>
  );
};

export default Leaders;
