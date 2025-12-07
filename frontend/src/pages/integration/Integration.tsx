import { Card, Col, Row, Flex, Tag, Button, Switch, Progress, Badge, Tooltip, Avatar, Divider } from "antd";
import CountUp from "react-countup";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ApiOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  LinkOutlined,
  SettingOutlined,
  ReloadOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { SiSalesforce, SiZendesk, SiSlack, SiTwilio, SiAmazon, SiGooglecloud } from "react-icons/si";
import { BsMicrosoftTeams } from "react-icons/bs";
import { BiCloud, BiServer } from "react-icons/bi";
import { FiDatabase, FiGlobe, FiPhone, FiMessageSquare } from "react-icons/fi";
import { HiOutlineStatusOnline } from "react-icons/hi";

import "./integration.scss";

interface IntegrationItem {
  id: string;
  name: string;
  category: "CRM" | "Communication" | "Storage" | "Analytics" | "Telephony";
  icon: React.ReactNode;
  status: "connected" | "error" | "syncing" | "disconnected";
  lastSync: string;
  dataPoints: number;
  health: number;
  enabled: boolean;
}

const integrations: IntegrationItem[] = [
  { id: "1", name: "Salesforce", category: "CRM", icon: <SiSalesforce />, status: "connected", lastSync: "2 mins ago", dataPoints: 45230, health: 98, enabled: true },
  { id: "2", name: "Zendesk", category: "CRM", icon: <SiZendesk />, status: "connected", lastSync: "5 mins ago", dataPoints: 28900, health: 95, enabled: true },
  { id: "3", name: "Slack", category: "Communication", icon: <SiSlack />, status: "syncing", lastSync: "Syncing...", dataPoints: 12400, health: 100, enabled: true },
  { id: "4", name: "Microsoft Teams", category: "Communication", icon: <BsMicrosoftTeams />, status: "connected", lastSync: "10 mins ago", dataPoints: 8900, health: 92, enabled: true },
  { id: "5", name: "Twilio", category: "Telephony", icon: <SiTwilio />, status: "error", lastSync: "1 hour ago", dataPoints: 156000, health: 45, enabled: true },
  { id: "6", name: "AWS S3", category: "Storage", icon: <SiAmazon />, status: "connected", lastSync: "1 min ago", dataPoints: 890000, health: 100, enabled: true },
  { id: "7", name: "Google Cloud", category: "Storage", icon: <SiGooglecloud />, status: "disconnected", lastSync: "Never", dataPoints: 0, health: 0, enabled: false },
  { id: "8", name: "Custom API", category: "Analytics", icon: <ApiOutlined />, status: "connected", lastSync: "30 secs ago", dataPoints: 34500, health: 88, enabled: true },
];

const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    connected: { color: "#52c41a", icon: <CheckCircleOutlined />, label: "Connected" },
    error: { color: "#ff4d4f", icon: <ExclamationCircleOutlined />, label: "Error" },
    syncing: { color: "#1890ff", icon: <SyncOutlined spin />, label: "Syncing" },
    disconnected: { color: "#8c8c8c", icon: <CloseCircleOutlined />, label: "Disconnected" },
  };
  return configs[status];
};

const Integration = () => {
  // API Traffic chart
  const trafficOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 250,
      toolbar: { show: false },
      stacked: true,
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    colors: ["#1890ff", "#52c41a", "#722ed1"],
    xaxis: {
      categories: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
      labels: { style: { colors: "#8c8c8c" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}k`,
        style: { colors: "#8c8c8c" },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#8c8c8c" },
    },
    grid: { borderColor: "#f0f0f0" },
    tooltip: {
      y: { formatter: (val: number) => `${val}k requests` },
    },
  };

  const trafficSeries = [
    { name: "Inbound", data: [12, 18, 45, 62, 48, 35, 28] },
    { name: "Outbound", data: [8, 12, 32, 48, 38, 25, 18] },
    { name: "Webhooks", data: [4, 6, 15, 22, 18, 12, 8] },
  ];

  // Latency chart
  const latencyOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      height: 250,
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#13c2c2"],
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: { style: { colors: "#8c8c8c" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}ms`,
        style: { colors: "#8c8c8c" },
      },
    },
    grid: { borderColor: "#f0f0f0" },
    markers: {
      size: 5,
      colors: ["#13c2c2"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
  };

  const latencySeries = [{ name: "Avg Latency", data: [120, 135, 125, 145, 130, 110, 105] }];

  // System health gauge
  const healthOptions: ApexCharts.ApexOptions = {
    chart: { type: "radialBar", height: 280 },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: "65%" },
        track: {
          background: "#f0f0f0",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            fontSize: "14px",
            color: "#8c8c8c",
            offsetY: 80,
          },
          value: {
            fontSize: "36px",
            fontWeight: 700,
            color: "#52c41a",
            offsetY: -10,
            formatter: (val: number) => `${val}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        gradientToColors: ["#52c41a"],
        stops: [0, 100],
      },
    },
    colors: ["#87d068"],
    labels: ["System Health"],
  };

  const connectedCount = integrations.filter((i) => i.status === "connected").length;
  const errorCount = integrations.filter((i) => i.status === "error").length;
  const totalDataPoints = integrations.reduce((sum, i) => sum + i.dataPoints, 0);

  return (
    <div className="integration-page">
      <Row gutter={[24, 24]}>
        {/* Stats Overview */}
        <Col span={24}>
          <Flex gap={24}>
            <Card className="stat-card stat-card--connected w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon">
                  <LinkOutlined />
                </div>
                <div>
                  <div className="stat-card__label">Connected</div>
                  <div className="stat-card__value">
                    <CountUp end={connectedCount} /> <span className="stat-card__total">/ {integrations.length}</span>
                  </div>
                </div>
              </Flex>
            </Card>

            <Card className="stat-card stat-card--error w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon stat-card__icon--error">
                  <ExclamationCircleOutlined />
                </div>
                <div>
                  <div className="stat-card__label">Errors</div>
                  <div className="stat-card__value stat-card__value--error">
                    <CountUp end={errorCount} />
                  </div>
                </div>
              </Flex>
            </Card>

            <Card className="stat-card stat-card--data w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon stat-card__icon--data">
                  <DatabaseOutlined />
                </div>
                <div>
                  <div className="stat-card__label">Data Points Synced</div>
                  <div className="stat-card__value">
                    <CountUp end={totalDataPoints} separator="," />
                  </div>
                </div>
              </Flex>
            </Card>

            <Card className="stat-card stat-card--uptime w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon stat-card__icon--uptime">
                  <HiOutlineStatusOnline size={24} />
                </div>
                <div>
                  <div className="stat-card__label">Uptime</div>
                  <div className="stat-card__value stat-card__value--uptime">99.9%</div>
                </div>
              </Flex>
            </Card>
          </Flex>
        </Col>

        {/* Charts Row */}
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col span={10}>
              <Card title="API Traffic" extra={<ReloadOutlined />} className="chart-card">
                <ReactApexChart options={trafficOptions} series={trafficSeries} type="area" height={250} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Response Latency" extra={<ReloadOutlined />} className="chart-card">
                <ReactApexChart options={latencyOptions} series={latencySeries} type="line" height={250} />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="System Health" className="chart-card">
                <ReactApexChart options={healthOptions} series={[94]} type="radialBar" height={260} />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Integrations Grid */}
        <Col span={24}>
          <Card
            title="Connected Services"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Integration
              </Button>
            }
            className="integrations-card"
          >
            <Row gutter={[20, 20]}>
              {integrations.map((integration) => {
                const statusConfig = getStatusConfig(integration.status);
                return (
                  <Col span={6} key={integration.id}>
                    <div className={`integration-item integration-item--${integration.status}`}>
                      <Flex justify="space-between" align="flex-start">
                        <Flex align="center" gap={12}>
                          <div className={`integration-item__icon integration-item__icon--${integration.category.toLowerCase()}`}>
                            {integration.icon}
                          </div>
                          <div>
                            <div className="integration-item__name">{integration.name}</div>
                            <Tag color="default" className="integration-item__category">{integration.category}</Tag>
                          </div>
                        </Flex>
                        <Switch size="small" checked={integration.enabled} />
                      </Flex>

                      <Divider className="my-3" />

                      <Flex justify="space-between" align="center" className="mb-2">
                        <span className="text-muted small">Status</span>
                        <Flex align="center" gap={6} style={{ color: statusConfig.color }}>
                          {statusConfig.icon}
                          <span>{statusConfig.label}</span>
                        </Flex>
                      </Flex>

                      <Flex justify="space-between" align="center" className="mb-2">
                        <span className="text-muted small">Last Sync</span>
                        <span className="small">{integration.lastSync}</span>
                      </Flex>

                      <Flex justify="space-between" align="center" className="mb-3">
                        <span className="text-muted small">Data Points</span>
                        <span className="fw-semibold">{integration.dataPoints.toLocaleString()}</span>
                      </Flex>

                      <div className="integration-item__health">
                        <Flex justify="space-between" className="mb-1">
                          <span className="text-muted small">Health</span>
                          <span className="small fw-semibold">{integration.health}%</span>
                        </Flex>
                        <Progress
                          percent={integration.health}
                          showInfo={false}
                          strokeColor={integration.health > 80 ? "#52c41a" : integration.health > 50 ? "#faad14" : "#ff4d4f"}
                          size="small"
                        />
                      </div>

                      <Flex gap={8} className="mt-3">
                        <Button size="small" block icon={<SettingOutlined />}>
                          Configure
                        </Button>
                        <Button size="small" icon={<ReloadOutlined />} />
                      </Flex>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Integration;
