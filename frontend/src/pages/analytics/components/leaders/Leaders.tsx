import { Card, Col, Row } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

interface Agent {
  name: string;
  performance: number; // performance percentage (0-100)
}

const agents: Agent[] = [
  // Top performers
  { name: "Rodrigo G.", performance: 95 },
  { name: "Sarah M.", performance: 94 },
  { name: "Emma T.", performance: 92 },
  { name: "James L.", performance: 91 },
  // Average performers
  { name: "Amirah N.", performance: 85 },
  { name: "Michael K.", performance: 82 },
  { name: "Diana P.", performance: 78 },
  { name: "Kevin R.", performance: 75 },
  // Laggers
  { name: "Veronica B.", performance: 65 },
  { name: "Tom H.", performance: 58 },
  { name: "Lisa W.", performance: 52 },
];

const Leaders = () => {
  const getPerformanceStyle = (performance: number) => {
    if (performance >= 90) {
      // Top performers - soft green
      return { background: "#4ade80" };
    } else if (performance >= 70) {
      // Average performers - soft yellow/amber
      return { background: "#fbbf24" };
    } else {
      // Laggers - soft coral/red
      return { background: "#f87171" };
    }
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
                  <div style={getPerformanceStyle(agent.performance)} className="heatmap-item">
                    {agent.name}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={getPerformanceStyle(agent.performance)} className="heatmap-item">
                    {agent.name}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={getPerformanceStyle(agent.performance)} className="heatmap-item">
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
