import { Card, Col, Row, Flex, Statistic, Table, Tag, Progress, Avatar, Tooltip, Rate } from "antd";
import type { StatisticProps, TableColumnsType } from "antd";
import CountUp from "react-countup";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import {
  UserOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  CrownOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarFilled,
  HeartOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { GiPodium } from "react-icons/gi";
import { BsPersonBadge, BsGraphUpArrow, BsEmojiSunglasses } from "react-icons/bs";
import { HiOutlineSparkles } from "react-icons/hi";
import { IoTrophySharp } from "react-icons/io5";

import "./agents.scss";

interface AgentRecord {
  key: string;
  name: string;
  avatar: string;
  department: string;
  status: "online" | "busy" | "offline";
  callsHandled: number;
  avgDuration: number;
  satisfaction: number;
  compliance: number;
  resolution: number;
  trend: "up" | "down" | "stable";
  rank: number;
}

const agentData: AgentRecord[] = [
  { key: "1", name: "Sarah Mitchell", avatar: "SM", department: "Sales", status: "online", callsHandled: 156, avgDuration: 245, satisfaction: 4.8, compliance: 98, resolution: 94, trend: "up", rank: 1 },
  { key: "2", name: "James Rodriguez", avatar: "JR", department: "Support", status: "online", callsHandled: 142, avgDuration: 312, satisfaction: 4.6, compliance: 95, resolution: 91, trend: "up", rank: 2 },
  { key: "3", name: "Emma Thompson", avatar: "ET", department: "Sales", status: "busy", callsHandled: 138, avgDuration: 198, satisfaction: 4.9, compliance: 99, resolution: 96, trend: "up", rank: 3 },
  { key: "4", name: "Michael Chen", avatar: "MC", department: "Retention", status: "online", callsHandled: 125, avgDuration: 280, satisfaction: 4.5, compliance: 92, resolution: 88, trend: "down", rank: 4 },
  { key: "5", name: "Lisa Park", avatar: "LP", department: "Support", status: "offline", callsHandled: 118, avgDuration: 267, satisfaction: 4.4, compliance: 94, resolution: 87, trend: "stable", rank: 5 },
  { key: "6", name: "David Wilson", avatar: "DW", department: "Sales", status: "online", callsHandled: 112, avgDuration: 225, satisfaction: 4.7, compliance: 96, resolution: 92, trend: "up", rank: 6 },
];

const topPerformers = [
  { name: "Emma Thompson", score: 96, department: "Sales", avatar: "ET", calls: 138, streak: 12 },
  { name: "Sarah Mitchell", score: 94, department: "Sales", avatar: "SM", calls: 156, streak: 8 },
  { name: "David Wilson", score: 92, department: "Sales", avatar: "DW", calls: 112, streak: 5 },
];

const columns: TableColumnsType<AgentRecord> = [
  {
    title: "Rank",
    dataIndex: "rank",
    key: "rank",
    width: 70,
    render: (rank: number) => (
      <div className={`rank-badge rank-badge--${rank <= 3 ? rank : "default"}`}>
        {rank <= 3 ? (
          rank === 1 ? <CrownOutlined /> : rank === 2 ? <TrophyOutlined /> : <StarFilled />
        ) : (
          `#${rank}`
        )}
      </div>
    ),
  },
  {
    title: "Agent",
    dataIndex: "name",
    key: "name",
    render: (text: string, record: AgentRecord) => (
      <Flex align="center" gap={12}>
        <div className="agent-avatar-wrapper">
          <Avatar
            size={44}
            style={{
              background: `linear-gradient(135deg, ${getAvatarGradient(record.rank)})`,
              fontWeight: 600
            }}
          >
            {record.avatar}
          </Avatar>
          <span className={`status-dot status-dot--${record.status}`} />
        </div>
        <div>
          <div className="agent-name">{text}</div>
          <Tag color={record.department === "Sales" ? "volcano" : record.department === "Support" ? "blue" : "green"} className="dept-tag">
            {record.department}
          </Tag>
        </div>
      </Flex>
    ),
  },
  {
    title: "Calls Handled",
    dataIndex: "callsHandled",
    key: "callsHandled",
    render: (val: number, record: AgentRecord) => (
      <Flex align="center" gap={8}>
        <span className="fw-bold" style={{ fontSize: 16 }}>{val}</span>
        {record.trend === "up" && <RiseOutlined className="text-success" />}
        {record.trend === "down" && <FallOutlined className="text-danger" />}
      </Flex>
    ),
  },
  {
    title: "Avg Duration",
    dataIndex: "avgDuration",
    key: "avgDuration",
    render: (seconds: number) => (
      <span className="text-muted">
        <ClockCircleOutlined /> {Math.floor(seconds / 60)}m {seconds % 60}s
      </span>
    ),
  },
  {
    title: "Satisfaction",
    dataIndex: "satisfaction",
    key: "satisfaction",
    render: (rating: number) => (
      <Flex align="center" gap={4}>
        <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 14 }} />
        <span className="fw-semibold" style={{ color: "#faad14" }}>{rating}</span>
      </Flex>
    ),
  },
  {
    title: "Compliance",
    dataIndex: "compliance",
    key: "compliance",
    render: (val: number) => (
      <Progress
        type="circle"
        percent={val}
        size={44}
        strokeColor={val >= 95 ? "#52c41a" : val >= 85 ? "#faad14" : "#ff4d4f"}
        format={() => `${val}%`}
      />
    ),
  },
  {
    title: "Resolution",
    dataIndex: "resolution",
    key: "resolution",
    render: (val: number) => (
      <div className="resolution-bar">
        <Progress
          percent={val}
          strokeColor={{
            "0%": "#722ed1",
            "100%": "#1890ff",
          }}
          trailColor="#f0f0f0"
          format={() => `${val}%`}
        />
      </div>
    ),
  },
];

function getAvatarGradient(rank: number): string {
  const gradients: Record<number, string> = {
    1: "#FFD700, #FFA500",
    2: "#C0C0C0, #A8A8A8",
    3: "#CD7F32, #A0522D",
    4: "#667eea, #764ba2",
    5: "#11998e, #38ef7d",
    6: "#ee0979, #ff6a00",
  };
  return gradients[rank] || "#667eea, #764ba2";
}

const Agents = () => {
  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
  );

  const percentFormatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} decimals={1} suffix="%" />
  );

  // Performance comparison radar chart
  const radarOptions: ApexCharts.ApexOptions = {
    chart: { type: "radar", height: 350, toolbar: { show: false } },
    colors: ["#722ed1", "#13c2c2", "#eb2f96"],
    stroke: { width: 2 },
    fill: { opacity: 0.2 },
    markers: { size: 4 },
    xaxis: {
      categories: ["Calls", "Duration", "Satisfaction", "Compliance", "Resolution", "Efficiency"],
      labels: { style: { colors: "#8c8c8c", fontSize: "12px" } },
    },
    yaxis: { show: false },
    legend: {
      position: "bottom",
      labels: { colors: "#8c8c8c" },
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: "#f0f0f0",
          connectorColors: "#f0f0f0",
        },
      },
    },
  };

  const radarSeries = [
    { name: "Top Performer", data: [95, 88, 98, 99, 96, 94] },
    { name: "Team Average", data: [78, 82, 85, 92, 88, 80] },
    { name: "Target", data: [85, 85, 90, 95, 90, 85] },
  ];

  // Performance trend over time
  const trendOptions: ApexCharts.ApexOptions = {
    chart: { type: "area", height: 300, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#722ed1", "#52c41a", "#1890ff"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
      labels: { style: { colors: "#8c8c8c" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}%`,
        style: { colors: "#8c8c8c" },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#8c8c8c" },
    },
    grid: { borderColor: "#f0f0f0" },
    tooltip: { y: { formatter: (val: number) => `${val}%` } },
  };

  const trendSeries = [
    { name: "Performance Score", data: [82, 85, 84, 88, 91, 93] },
    { name: "Satisfaction Rate", data: [88, 86, 89, 91, 90, 94] },
    { name: "Compliance Rate", data: [92, 94, 93, 95, 96, 97] },
  ];

  // Department breakdown donut
  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", height: 280 },
    labels: ["Sales", "Support", "Retention"],
    colors: ["#fa541c", "#1890ff", "#52c41a"],
    legend: {
      position: "bottom",
      labels: { colors: "#8c8c8c" },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Agents",
              formatter: () => "24",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  const donutSeries = [10, 8, 6];

  // Mini sparkline for stat cards
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
    <div className="agents-page">
      <Row gutter={[24, 24]}>
        {/* Top Section - Stats Cards */}
        <Col span={24}>
          <Flex gap={24}>
            <Card className="stat-card stat-card--gradient-purple w-100">
              <div className="stat-card__icon">
                <BsPersonBadge size={28} />
              </div>
              <Statistic
                title="Active Agents"
                value={18}
                formatter={formatter}
                suffix={<span className="stat-subtitle">/ 24 total</span>}
              />
              <div className="sassy-tagline">Slaying it today</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#722ed1"] }}
                series={[{ data: [12, 14, 15, 16, 17, 18, 18] }]}
                type="area"
                height={60}
              />
            </Card>

            <Card className="stat-card stat-card--gradient-green w-100">
              <div className="stat-card__icon stat-card__icon--success">
                <BsGraphUpArrow size={26} />
              </div>
              <Statistic
                title="Avg Performance"
                value={91.4}
                formatter={percentFormatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +3.2%
                  </span>
                }
              />
              <div className="sassy-tagline">Numbers don't lie, bestie</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#52c41a"] }}
                series={[{ data: [85, 86, 88, 89, 90, 91, 91.4] }]}
                type="area"
                height={60}
              />
            </Card>

            <Card className="stat-card stat-card--gradient-gold w-100">
              <div className="stat-card__icon stat-card__icon--gold">
                <IoTrophySharp size={28} />
              </div>
              <Statistic
                title="Top Score Today"
                value={98.7}
                formatter={percentFormatter}
              />
              <div className="sassy-tagline">Emma said hold my coffee</div>
              <div className="top-scorer">
                <Avatar size={24} style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)" }}>ET</Avatar>
                <span>Emma Thompson</span>
              </div>
            </Card>

            <Card className="stat-card stat-card--gradient-coral w-100">
              <div className="stat-card__icon stat-card__icon--coral">
                <PhoneOutlined style={{ fontSize: 26 }} />
              </div>
              <Statistic
                title="Calls Today"
                value={847}
                formatter={formatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +12%
                  </span>
                }
              />
              <div className="sassy-tagline">Phones go brrrr</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#ff7875"] }}
                series={[{ data: [650, 680, 720, 780, 800, 830, 847] }]}
                type="area"
                height={60}
              />
            </Card>
          </Flex>
        </Col>

        {/* Podium Section */}
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card className="podium-card" title={<><GiPodium size={20} /> Today's Champions</>}>
                <div className="podium-wrapper">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.name} className={`podium-item podium-item--${index + 1}`}>
                      <div className="podium-avatar">
                        <Avatar
                          size={index === 0 ? 72 : 56}
                          style={{
                            background: `linear-gradient(135deg, ${getAvatarGradient(index + 1)})`,
                            fontWeight: 700,
                            fontSize: index === 0 ? 24 : 18,
                          }}
                        >
                          {performer.avatar}
                        </Avatar>
                        <div className={`podium-crown podium-crown--${index + 1}`}>
                          {index === 0 && <CrownOutlined style={{ color: "#FFD700", fontSize: 24 }} />}
                          {index === 1 && <TrophyOutlined style={{ color: "#C0C0C0", fontSize: 20 }} />}
                          {index === 2 && <StarFilled style={{ color: "#CD7F32", fontSize: 18 }} />}
                        </div>
                      </div>
                      <div className="podium-info">
                        <div className="podium-name">{performer.name}</div>
                        <div className="podium-score">{performer.score}%</div>
                        <div className="podium-streak">
                          <FireOutlined style={{ color: "#ff4d4f" }} /> {performer.streak} day streak
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="podium-sass">Keep slaying, queens & kings</div>
              </Card>
            </Col>
            <Col span={10}>
              <Card
                title={<><BsGraphUpArrow style={{ marginRight: 8 }} /> Performance Trends</>}
                className="chart-card"
                extra={<Tag color="purple"><HiOutlineSparkles /> Live</Tag>}
              >
                <ReactApexChart options={trendOptions} series={trendSeries} type="area" height={300} />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Team Radar" className="chart-card">
                <ReactApexChart options={radarOptions} series={radarSeries} type="radar" height={320} />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Agent Leaderboard Table */}
        <Col span={24}>
          <Card
            title={<><TrophyOutlined style={{ color: "#faad14", marginRight: 8 }} /> Agent Leaderboard</>}
            className="table-card"
            extra={
              <Flex gap={12}>
                <Tag color="success"><CheckCircleOutlined /> 18 Online</Tag>
                <Tag color="processing"><ThunderboltOutlined /> Real-time</Tag>
              </Flex>
            }
          >
            <Table
              columns={columns}
              dataSource={agentData}
              pagination={false}
              className="agents-table"
            />
            <div className="table-sass">
              <BsEmojiSunglasses size={16} /> These agents? Absolutely iconic.
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Agents;
