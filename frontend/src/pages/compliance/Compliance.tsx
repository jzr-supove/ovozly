import { Card, Col, Row, Flex, Statistic, Table, Tag, Progress, Badge, Avatar, Tooltip, Timeline, Alert } from "antd";
import type { StatisticProps, TableColumnsType } from "antd";
import CountUp from "react-countup";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FallOutlined,
  RiseOutlined,
  SafetyOutlined,
  AlertOutlined,
  AuditOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { BiShieldX, BiShieldQuarter } from "react-icons/bi";
import { MdOutlinePolicy, MdOutlineGavel } from "react-icons/md";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { TbAlertTriangle, TbShieldCheck } from "react-icons/tb";

import "./compliance.scss";

interface ViolationRecord {
  key: string;
  id: string;
  agent: { name: string; avatar: string };
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  policy: string;
  timestamp: string;
  status: "open" | "reviewing" | "resolved" | "escalated";
  callId: string;
  description: string;
}

const violationData: ViolationRecord[] = [
  { key: "1", id: "VIO-2847", agent: { name: "Mark Stevens", avatar: "MS" }, type: "Script Deviation", severity: "high", policy: "Call Script Adherence", timestamp: "2 mins ago", status: "open", callId: "CALL-9821", description: "Agent skipped mandatory compliance disclosure" },
  { key: "2", id: "VIO-2846", agent: { name: "Lisa Chen", avatar: "LC" }, type: "Data Disclosure", severity: "critical", policy: "PII Protection", timestamp: "15 mins ago", status: "escalated", callId: "CALL-9819", description: "Customer SSN mentioned without secure verification" },
  { key: "3", id: "VIO-2845", agent: { name: "James Wilson", avatar: "JW" }, type: "Tone Violation", severity: "medium", policy: "Professional Conduct", timestamp: "32 mins ago", status: "reviewing", callId: "CALL-9815", description: "Raised voice detected during customer interaction" },
  { key: "4", id: "VIO-2844", agent: { name: "Sarah Miller", avatar: "SM" }, type: "Hold Time", severity: "low", policy: "Customer Wait Standards", timestamp: "1 hour ago", status: "resolved", callId: "CALL-9810", description: "Customer on hold for 4+ minutes without check-in" },
  { key: "5", id: "VIO-2843", agent: { name: "David Kim", avatar: "DK" }, type: "Script Deviation", severity: "high", policy: "Call Script Adherence", timestamp: "1.5 hours ago", status: "reviewing", callId: "CALL-9805", description: "Failed to mention promotional terms and conditions" },
  { key: "6", id: "VIO-2842", agent: { name: "Emily Brown", avatar: "EB" }, type: "Unauthorized Promise", severity: "critical", policy: "Authorization Limits", timestamp: "2 hours ago", status: "escalated", callId: "CALL-9798", description: "Promised refund exceeding agent authorization level" },
];

const recentActivity = [
  { type: "resolved", text: "VIO-2840 marked as resolved", agent: "Auto-review", time: "5 mins ago" },
  { type: "escalated", text: "VIO-2846 escalated to compliance team", agent: "System", time: "15 mins ago" },
  { type: "new", text: "New critical violation detected", agent: "AI Monitor", time: "15 mins ago" },
  { type: "review", text: "VIO-2843 under review", agent: "Mike Johnson", time: "30 mins ago" },
  { type: "resolved", text: "VIO-2838 coaching completed", agent: "Team Lead", time: "1 hour ago" },
];

const policyStats = [
  { name: "Call Script Adherence", violations: 23, trend: -12, compliance: 94 },
  { name: "PII Protection", violations: 8, trend: -2, compliance: 98 },
  { name: "Professional Conduct", violations: 15, trend: +3, compliance: 96 },
  { name: "Authorization Limits", violations: 11, trend: -5, compliance: 97 },
];

const columns: TableColumnsType<ViolationRecord> = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 120,
    render: (id: string, record: ViolationRecord) => (
      <div className={`violation-id violation-id--${record.severity}`}>
        {record.severity === "critical" && <AlertOutlined />}
        {record.severity === "high" && <WarningOutlined />}
        {record.severity === "medium" && <ExclamationCircleOutlined />}
        {record.severity === "low" && <ClockCircleOutlined />}
        <span>{id}</span>
      </div>
    ),
  },
  {
    title: "Agent",
    key: "agent",
    render: (_: unknown, record: ViolationRecord) => (
      <Flex align="center" gap={10}>
        <Avatar
          size={38}
          style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", fontWeight: 600 }}
        >
          {record.agent.avatar}
        </Avatar>
        <div>
          <div className="agent-name">{record.agent.name}</div>
          <div className="call-id">{record.callId}</div>
        </div>
      </Flex>
    ),
  },
  {
    title: "Violation Type",
    dataIndex: "type",
    key: "type",
    render: (type: string, record: ViolationRecord) => (
      <div>
        <Tag
          color={
            record.severity === "critical" ? "red" :
            record.severity === "high" ? "orange" :
            record.severity === "medium" ? "gold" : "blue"
          }
          className="violation-type-tag"
        >
          {type}
        </Tag>
        <div className="policy-name">{record.policy}</div>
      </div>
    ),
  },
  {
    title: "Severity",
    dataIndex: "severity",
    key: "severity",
    render: (severity: string) => (
      <Badge
        status={
          severity === "critical" ? "error" :
          severity === "high" ? "warning" :
          severity === "medium" ? "processing" : "default"
        }
        text={
          <span className={`severity-text severity-text--${severity}`}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </span>
        }
      />
    ),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    ellipsis: true,
    render: (desc: string) => (
      <Tooltip title={desc}>
        <span className="violation-desc">{desc}</span>
      </Tooltip>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
        open: { color: "red", icon: <ExclamationCircleOutlined /> },
        reviewing: { color: "processing", icon: <EyeOutlined /> },
        resolved: { color: "success", icon: <CheckCircleOutlined /> },
        escalated: { color: "volcano", icon: <WarningOutlined /> },
      };
      const config = statusConfig[status];
      return (
        <Tag color={config.color} icon={config.icon} className="status-tag">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      );
    },
  },
  {
    title: "Time",
    dataIndex: "timestamp",
    key: "timestamp",
    render: (time: string) => <span className="text-muted">{time}</span>,
  },
];

const Compliance = () => {
  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
  );

  const percentFormatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} decimals={1} suffix="%" />
  );

  // Violations trend chart
  const trendOptions: ApexCharts.ApexOptions = {
    chart: { type: "area", height: 300, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#ff4d4f", "#faad14", "#1890ff"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 100] },
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: { style: { colors: "#8c8c8c" } },
    },
    yaxis: {
      labels: { style: { colors: "#8c8c8c" } },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#8c8c8c" },
    },
    grid: { borderColor: "#f0f0f0" },
    tooltip: { shared: true },
  };

  const trendSeries = [
    { name: "Critical/High", data: [8, 12, 9, 15, 11, 6, 5] },
    { name: "Medium", data: [15, 18, 14, 20, 16, 10, 8] },
    { name: "Low", data: [22, 25, 20, 28, 24, 15, 12] },
  ];

  // Violation categories donut
  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", height: 280 },
    labels: ["Script Deviation", "Data Protection", "Conduct", "Authorization", "Other"],
    colors: ["#722ed1", "#13c2c2", "#eb2f96", "#fa8c16", "#8c8c8c"],
    legend: { position: "bottom", labels: { colors: "#8c8c8c" } },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => "57",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  const donutSeries = [23, 8, 15, 11, 5];

  // Compliance score gauge
  const gaugeOptions: ApexCharts.ApexOptions = {
    chart: { type: "radialBar", height: 280 },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: "70%" },
        track: { background: "#f0f0f0", strokeWidth: "100%" },
        dataLabels: {
          name: { fontSize: "14px", color: "#8c8c8c", offsetY: 80 },
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
        shadeIntensity: 0.5,
        gradientToColors: ["#73d13d"],
        opacityFrom: 1,
        opacityTo: 1,
      },
    },
    colors: ["#52c41a"],
    stroke: { lineCap: "round" },
    labels: ["Compliance Score"],
  };

  // Sparkline for stat cards
  const sparklineOptions: ApexCharts.ApexOptions = {
    chart: { type: "area", height: 60, sparkline: { enabled: true }, toolbar: { show: false } },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 100] },
    },
    tooltip: { enabled: false },
  };

  return (
    <div className="compliance-page">
      {/* Alert Banner */}
      <Alert
        message={
          <Flex align="center" gap={8}>
            <TbAlertTriangle size={18} />
            <span><strong>2 Critical Violations</strong> require immediate attention. Your compliance score is looking spicy today.</span>
          </Flex>
        }
        type="error"
        showIcon={false}
        banner
        className="compliance-alert"
      />

      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        {/* Stats Cards */}
        <Col span={24}>
          <Flex gap={24}>
            <Card className="stat-card stat-card--success w-100">
              <div className="stat-card__icon">
                <TbShieldCheck size={28} />
              </div>
              <Statistic
                title="Compliance Score"
                value={96.2}
                formatter={percentFormatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +1.8%
                  </span>
                }
              />
              <div className="sassy-tagline">We see you being responsible</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#52c41a"] }}
                series={[{ data: [92, 93, 94, 93, 95, 95.5, 96.2] }]}
                type="area"
                height={60}
              />
            </Card>

            <Card className="stat-card stat-card--danger w-100">
              <div className="stat-card__icon stat-card__icon--danger">
                <BiShieldX size={28} />
              </div>
              <Statistic
                title="Open Violations"
                value={12}
                formatter={formatter}
                suffix={
                  <span className="stat-trend stat-trend--down">
                    <FallOutlined /> -4
                  </span>
                }
              />
              <div className="sassy-tagline">Down bad but getting better</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#ff4d4f"] }}
                series={[{ data: [25, 22, 20, 18, 15, 14, 12] }]}
                type="area"
                height={60}
              />
            </Card>

            <Card className="stat-card stat-card--warning w-100">
              <div className="stat-card__icon stat-card__icon--warning">
                <MdOutlineGavel size={28} />
              </div>
              <Statistic
                title="Under Review"
                value={8}
                formatter={formatter}
              />
              <div className="sassy-tagline">The jury's still out</div>
              <Progress
                percent={67}
                strokeColor={{ "0%": "#faad14", "100%": "#ffc53d" }}
                format={() => "67% reviewed"}
                size="small"
                style={{ marginTop: 12 }}
              />
            </Card>

            <Card className="stat-card stat-card--purple w-100">
              <div className="stat-card__icon stat-card__icon--purple">
                <AuditOutlined style={{ fontSize: 26 }} />
              </div>
              <Statistic
                title="Resolved This Week"
                value={45}
                formatter={formatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +12
                  </span>
                }
              />
              <div className="sassy-tagline">Cleaning house like pros</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#722ed1"] }}
                series={[{ data: [28, 32, 35, 38, 40, 43, 45] }]}
                type="area"
                height={60}
              />
            </Card>
          </Flex>
        </Col>

        {/* Charts Row */}
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col span={10}>
              <Card
                title={<><HiOutlineDocumentReport size={18} style={{ marginRight: 8 }} /> Violation Trends</>}
                className="chart-card"
                extra={<Tag color="red"><AlertOutlined /> Live Monitoring</Tag>}
              >
                <ReactApexChart options={trendOptions} series={trendSeries} type="area" height={300} />
              </Card>
            </Col>
            <Col span={7}>
              <Card title={<><MdOutlinePolicy size={18} style={{ marginRight: 8 }} /> By Category</>} className="chart-card">
                <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={300} />
              </Card>
            </Col>
            <Col span={7}>
              <Card title={<><BiShieldQuarter size={18} style={{ marginRight: 8 }} /> Overall Score</>} className="chart-card">
                <ReactApexChart options={gaugeOptions} series={[96.2]} type="radialBar" height={280} />
                <div className="score-sass">Not too shabby, team</div>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Policy Stats & Activity */}
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col span={16}>
              {/* Policy Compliance Cards */}
              <Card title={<><FileProtectOutlined style={{ marginRight: 8 }} /> Policy Compliance</>} className="policy-card">
                <Row gutter={[16, 16]}>
                  {policyStats.map((policy) => (
                    <Col span={6} key={policy.name}>
                      <div className="policy-stat">
                        <div className="policy-stat__header">
                          <span className="policy-stat__name">{policy.name}</span>
                          <span className={`policy-stat__trend ${policy.trend < 0 ? "down" : "up"}`}>
                            {policy.trend < 0 ? <FallOutlined /> : <RiseOutlined />}
                            {Math.abs(policy.trend)}
                          </span>
                        </div>
                        <Progress
                          percent={policy.compliance}
                          strokeColor={policy.compliance >= 95 ? "#52c41a" : policy.compliance >= 90 ? "#faad14" : "#ff4d4f"}
                          format={() => `${policy.compliance}%`}
                        />
                        <div className="policy-stat__violations">
                          {policy.violations} violations this week
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
            <Col span={8}>
              <Card title={<><ClockCircleOutlined style={{ marginRight: 8 }} /> Recent Activity</>} className="activity-card">
                <Timeline
                  items={recentActivity.map((item) => ({
                    color: item.type === "resolved" ? "green" : item.type === "escalated" ? "red" : item.type === "new" ? "red" : "blue",
                    children: (
                      <div className="activity-item">
                        <div className="activity-text">{item.text}</div>
                        <div className="activity-meta">
                          <span>{item.agent}</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                    ),
                  }))}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Violations Table */}
        <Col span={24}>
          <Card
            title={<><WarningOutlined style={{ color: "#faad14", marginRight: 8 }} /> Active Violations</>}
            className="table-card"
            extra={
              <Flex gap={8}>
                <Tag color="error"><CloseCircleOutlined /> 2 Critical</Tag>
                <Tag color="warning"><WarningOutlined /> 3 High</Tag>
                <Tag color="processing"><ExclamationCircleOutlined /> 2 Medium</Tag>
              </Flex>
            }
          >
            <Table
              columns={columns}
              dataSource={violationData}
              pagination={false}
              className="violations-table"
            />
            <div className="table-sass">
              <SafetyOutlined /> Stay compliant, stay winning. It's giving responsible.
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Compliance;
