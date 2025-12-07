import { Card, Col, Row, Flex, Statistic, Table, Tag, Progress, Avatar, Rate, List, Tooltip } from "antd";
import type { StatisticProps, TableColumnsType } from "antd";
import CountUp from "react-countup";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import {
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  RiseOutlined,
  FallOutlined,
  HeartOutlined,
  StarOutlined,
  LikeOutlined,
  DislikeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MessageOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { PiSmileyBold, PiSmileyMehBold, PiSmileySadBold, PiHeartFill } from "react-icons/pi";
import { BiHappyHeartEyes, BiSad } from "react-icons/bi";
import { HiOutlineEmojiHappy, HiOutlineSparkles } from "react-icons/hi";
import { MdOutlineSentimentVerySatisfied, MdOutlineFeedback } from "react-icons/md";
import { TbMoodHappy, TbHeartHandshake, TbStars } from "react-icons/tb";
import { BsEmojiHeartEyes, BsGraphUpArrow } from "react-icons/bs";

import "./satisfaction.scss";

interface FeedbackRecord {
  key: string;
  customer: { name: string; avatar: string };
  rating: number;
  sentiment: "positive" | "neutral" | "negative";
  feedback: string;
  agent: string;
  timestamp: string;
  resolved: boolean;
  nps: number;
}

const feedbackData: FeedbackRecord[] = [
  { key: "1", customer: { name: "Jennifer Adams", avatar: "JA" }, rating: 5, sentiment: "positive", feedback: "Sarah was absolutely amazing! She solved my issue in minutes and was so patient.", agent: "Sarah Mitchell", timestamp: "15 mins ago", resolved: true, nps: 10 },
  { key: "2", customer: { name: "Robert Chen", avatar: "RC" }, rating: 5, sentiment: "positive", feedback: "Best customer service I've ever experienced. James went above and beyond!", agent: "James Rodriguez", timestamp: "32 mins ago", resolved: true, nps: 10 },
  { key: "3", customer: { name: "Maria Garcia", avatar: "MG" }, rating: 4, sentiment: "positive", feedback: "Quick resolution, very professional. Would recommend to others.", agent: "Emma Thompson", timestamp: "1 hour ago", resolved: true, nps: 8 },
  { key: "4", customer: { name: "David Kim", avatar: "DK" }, rating: 3, sentiment: "neutral", feedback: "Issue was resolved but took longer than expected. Agent was nice though.", agent: "Michael Chen", timestamp: "2 hours ago", resolved: true, nps: 6 },
  { key: "5", customer: { name: "Lisa Park", avatar: "LP" }, rating: 2, sentiment: "negative", feedback: "Had to repeat my issue multiple times. Frustrating experience.", agent: "Lisa Park", timestamp: "3 hours ago", resolved: false, nps: 3 },
  { key: "6", customer: { name: "James Wilson", avatar: "JW" }, rating: 5, sentiment: "positive", feedback: "Emma is a star! Made my day so much better with her positive attitude.", agent: "Emma Thompson", timestamp: "4 hours ago", resolved: true, nps: 10 },
];

const topTestimonials = [
  { quote: "Honestly the best support team I've ever dealt with. 10/10 would call again!", customer: "Amanda S.", rating: 5 },
  { quote: "James literally saved my day. Give this man a raise!", customer: "Thomas M.", rating: 5 },
  { quote: "Fast, friendly, and actually solved my problem. What more could you ask for?", customer: "Rachel K.", rating: 5 },
];

const satisfactionBreakdown = [
  { category: "First Call Resolution", score: 87, icon: <TrophyOutlined /> },
  { category: "Agent Friendliness", score: 94, icon: <HeartOutlined /> },
  { category: "Wait Time", score: 78, icon: <ClockCircleOutlined /> },
  { category: "Problem Solving", score: 91, icon: <StarOutlined /> },
];

const columns: TableColumnsType<FeedbackRecord> = [
  {
    title: "Customer",
    key: "customer",
    render: (_: unknown, record: FeedbackRecord) => (
      <Flex align="center" gap={10}>
        <Avatar
          size={40}
          style={{
            background: record.sentiment === "positive" ? "linear-gradient(135deg, #52c41a, #73d13d)" :
              record.sentiment === "neutral" ? "linear-gradient(135deg, #faad14, #ffc53d)" :
              "linear-gradient(135deg, #ff4d4f, #ff7875)",
            fontWeight: 600
          }}
        >
          {record.customer.avatar}
        </Avatar>
        <div>
          <div className="customer-name">{record.customer.name}</div>
          <div className="customer-time">{record.timestamp}</div>
        </div>
      </Flex>
    ),
  },
  {
    title: "Rating",
    dataIndex: "rating",
    key: "rating",
    render: (rating: number) => (
      <Rate disabled defaultValue={rating} style={{ fontSize: 16 }} />
    ),
  },
  {
    title: "Sentiment",
    dataIndex: "sentiment",
    key: "sentiment",
    render: (sentiment: string) => (
      <Tag
        icon={
          sentiment === "positive" ? <SmileOutlined /> :
          sentiment === "neutral" ? <MehOutlined /> :
          <FrownOutlined />
        }
        color={
          sentiment === "positive" ? "success" :
          sentiment === "neutral" ? "warning" :
          "error"
        }
        className="sentiment-tag"
      >
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </Tag>
    ),
  },
  {
    title: "Feedback",
    dataIndex: "feedback",
    key: "feedback",
    ellipsis: true,
    render: (text: string) => (
      <Tooltip title={text}>
        <span className="feedback-text">"{text}"</span>
      </Tooltip>
    ),
  },
  {
    title: "Agent",
    dataIndex: "agent",
    key: "agent",
    render: (agent: string) => (
      <Flex align="center" gap={6}>
        <UserOutlined style={{ color: "#722ed1" }} />
        <span className="agent-name">{agent}</span>
      </Flex>
    ),
  },
  {
    title: "NPS",
    dataIndex: "nps",
    key: "nps",
    render: (nps: number) => (
      <div className={`nps-score nps-score--${nps >= 9 ? "promoter" : nps >= 7 ? "passive" : "detractor"}`}>
        {nps}
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "resolved",
    key: "resolved",
    render: (resolved: boolean) => (
      <Tag color={resolved ? "success" : "processing"} className="status-tag">
        {resolved ? <LikeOutlined /> : <ClockCircleOutlined />}
        {resolved ? " Resolved" : " Pending"}
      </Tag>
    ),
  },
];

const Satisfaction = () => {
  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
  );

  const percentFormatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} decimals={1} suffix="%" />
  );

  // CSAT trend over time
  const csatTrendOptions: ApexCharts.ApexOptions = {
    chart: { type: "area", height: 300, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#52c41a", "#722ed1"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 100] },
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: { style: { colors: "#8c8c8c" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}%`,
        style: { colors: "#8c8c8c" },
      },
      min: 70,
      max: 100,
    },
    legend: { position: "top", horizontalAlign: "right", labels: { colors: "#8c8c8c" } },
    grid: { borderColor: "#f0f0f0" },
    annotations: {
      yaxis: [{
        y: 85,
        borderColor: "#faad14",
        label: {
          borderColor: "#faad14",
          style: { color: "#fff", background: "#faad14" },
          text: "Target",
        },
      }],
    },
  };

  const csatTrendSeries = [
    { name: "CSAT Score", data: [87, 89, 88, 92, 90, 91, 92.4] },
    { name: "NPS Score", data: [82, 85, 84, 88, 86, 89, 91] },
  ];

  // Sentiment distribution donut
  const sentimentDonutOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", height: 280 },
    labels: ["Happy Customers", "Neutral", "Unhappy"],
    colors: ["#52c41a", "#faad14", "#ff4d4f"],
    legend: { position: "bottom", labels: { colors: "#8c8c8c" } },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Reviews",
              formatter: () => "2,847",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  const sentimentDonutSeries = [2250, 420, 177];

  // Rating distribution bar
  const ratingBarOptions: ApexCharts.ApexOptions = {
    chart: { type: "bar", height: 280, toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: "60%",
        distributed: true,
      },
    },
    colors: ["#ff4d4f", "#ff7a45", "#faad14", "#95de64", "#52c41a"],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      style: { colors: ["#fff"], fontWeight: 700 },
    },
    xaxis: {
      categories: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
      labels: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#8c8c8c", fontSize: "12px" },
      },
    },
    legend: { show: false },
    grid: { show: false },
  };

  const ratingBarSeries = [{ data: [3, 5, 12, 28, 52] }];

  // NPS Gauge
  const npsGaugeOptions: ApexCharts.ApexOptions = {
    chart: { type: "radialBar", height: 280 },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: "65%" },
        track: { background: "#f0f0f0", strokeWidth: "100%" },
        dataLabels: {
          name: { fontSize: "14px", color: "#8c8c8c", offsetY: 80 },
          value: {
            fontSize: "42px",
            fontWeight: 800,
            color: "#52c41a",
            offsetY: -10,
            formatter: () => "+68",
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
        gradientToColors: ["#95de64"],
        opacityFrom: 1,
        opacityTo: 1,
      },
    },
    colors: ["#52c41a"],
    stroke: { lineCap: "round" },
    labels: ["NPS Score"],
  };

  // Sparkline options
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
    <div className="satisfaction-page">
      <Row gutter={[24, 24]}>
        {/* Hero Stats */}
        <Col span={24}>
          <Flex gap={24}>
            <Card className="stat-card stat-card--gradient-green w-100">
              <div className="stat-card__icon">
                <BsEmojiHeartEyes size={28} />
              </div>
              <Statistic
                title="Customer Satisfaction"
                value={92.4}
                formatter={percentFormatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +2.8%
                  </span>
                }
              />
              <div className="sassy-tagline">Customers are literally obsessed</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#52c41a"] }}
                series={[{ data: [85, 87, 88, 90, 91, 92, 92.4] }]}
                type="area"
                height={60}
              />
            </Card>

            <Card className="stat-card stat-card--gradient-purple w-100">
              <div className="stat-card__icon stat-card__icon--purple">
                <TbHeartHandshake size={28} />
              </div>
              <Statistic
                title="Net Promoter Score"
                value={68}
                formatter={formatter}
                prefix="+"
              />
              <div className="sassy-tagline">They'd literally recommend us to their grandma</div>
              <div className="nps-breakdown">
                <span className="promoter">78% Promoters</span>
                <span className="detractor">10% Detractors</span>
              </div>
            </Card>

            <Card className="stat-card stat-card--gradient-gold w-100">
              <div className="stat-card__icon stat-card__icon--gold">
                <TbStars size={28} />
              </div>
              <Statistic
                title="Avg. Rating"
                value={4.7}
                suffix={<span className="rating-suffix">/ 5</span>}
              />
              <div className="sassy-tagline">We're giving 5-star energy</div>
              <Rate disabled defaultValue={4.7} allowHalf style={{ marginTop: 8, fontSize: 18 }} />
            </Card>

            <Card className="stat-card stat-card--gradient-pink w-100">
              <div className="stat-card__icon stat-card__icon--pink">
                <MdOutlineFeedback size={28} />
              </div>
              <Statistic
                title="Reviews This Week"
                value={847}
                formatter={formatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +156
                  </span>
                }
              />
              <div className="sassy-tagline">The people have spoken</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#eb2f96"] }}
                series={[{ data: [620, 680, 720, 760, 800, 830, 847] }]}
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
                title={<><BsGraphUpArrow style={{ marginRight: 8 }} /> Satisfaction Trends</>}
                className="chart-card"
                extra={<Tag color="success"><HiOutlineSparkles /> Exceeding Target</Tag>}
              >
                <ReactApexChart options={csatTrendOptions} series={csatTrendSeries} type="area" height={300} />
              </Card>
            </Col>
            <Col span={7}>
              <Card title={<><TbMoodHappy size={18} style={{ marginRight: 8 }} /> Sentiment Split</>} className="chart-card">
                <ReactApexChart options={sentimentDonutOptions} series={sentimentDonutSeries} type="donut" height={280} />
                <div className="chart-sass">79% are literally thriving</div>
              </Card>
            </Col>
            <Col span={7}>
              <Card title={<><StarOutlined style={{ marginRight: 8 }} /> Rating Breakdown</>} className="chart-card">
                <ReactApexChart options={ratingBarOptions} series={ratingBarSeries} type="bar" height={280} />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Satisfaction Metrics & Testimonials */}
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card title={<><TrophyOutlined style={{ color: "#faad14", marginRight: 8 }} /> Satisfaction Drivers</>} className="drivers-card">
                <div className="drivers-list">
                  {satisfactionBreakdown.map((item) => (
                    <div key={item.category} className="driver-item">
                      <Flex justify="space-between" align="center">
                        <Flex align="center" gap={8}>
                          <span className="driver-icon">{item.icon}</span>
                          <span className="driver-name">{item.category}</span>
                        </Flex>
                        <span className={`driver-score ${item.score >= 90 ? "excellent" : item.score >= 80 ? "good" : "needs-work"}`}>
                          {item.score}%
                        </span>
                      </Flex>
                      <Progress
                        percent={item.score}
                        strokeColor={item.score >= 90 ? "#52c41a" : item.score >= 80 ? "#faad14" : "#ff4d4f"}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  ))}
                </div>
                <div className="drivers-sass">
                  <HeartOutlined /> Friendliness is our superpower
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title={<><PiHeartFill style={{ color: "#eb2f96", marginRight: 8 }} /> Wall of Love</>} className="testimonials-card">
                <List
                  dataSource={topTestimonials}
                  renderItem={(item) => (
                    <List.Item className="testimonial-item">
                      <div className="testimonial-content">
                        <div className="testimonial-quote">"{item.quote}"</div>
                        <Flex justify="space-between" align="center">
                          <span className="testimonial-customer">— {item.customer}</span>
                          <Rate disabled defaultValue={item.rating} style={{ fontSize: 12 }} />
                        </Flex>
                      </div>
                    </List.Item>
                  )}
                />
                <div className="testimonials-sass">
                  <BiHappyHeartEyes size={16} /> We're blushing over here
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title={<><MdOutlineSentimentVerySatisfied size={18} style={{ marginRight: 8 }} /> NPS Score</>} className="nps-card">
                <ReactApexChart options={npsGaugeOptions} series={[84]} type="radialBar" height={260} />
                <div className="nps-sass">World-class territory, bestie</div>
                <div className="nps-legend">
                  <span className="legend-item legend-item--promoter">Promoters: 78%</span>
                  <span className="legend-item legend-item--passive">Passive: 12%</span>
                  <span className="legend-item legend-item--detractor">Detractors: 10%</span>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Recent Feedback Table */}
        <Col span={24}>
          <Card
            title={<><MessageOutlined style={{ marginRight: 8 }} /> Recent Feedback</>}
            className="table-card"
            extra={
              <Flex gap={8}>
                <Tag color="success" icon={<SmileOutlined />}>2,250 Happy</Tag>
                <Tag color="warning" icon={<MehOutlined />}>420 Neutral</Tag>
                <Tag color="error" icon={<FrownOutlined />}>177 Unhappy</Tag>
              </Flex>
            }
          >
            <Table
              columns={columns}
              dataSource={feedbackData}
              pagination={false}
              className="feedback-table"
            />
            <div className="table-sass">
              <HiOutlineEmojiHappy size={18} /> These reviews? *chef's kiss*
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Satisfaction;
