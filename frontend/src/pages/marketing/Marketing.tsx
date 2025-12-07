import { Card, Col, Row, Flex, Statistic, Table, Tag, Progress, Badge, Avatar, Tooltip, List } from "antd";
import type { StatisticProps, TableColumnsType } from "antd";
import CountUp from "react-countup";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import {
  RiseOutlined,
  FallOutlined,
  FireOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  StarOutlined,
  HeartOutlined,
  MessageOutlined,
  TagOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { BiTrendingUp, BiMessageRoundedDetail } from "react-icons/bi";
import { MdOutlineCampaign, MdOutlineInsights, MdAutoGraph } from "react-icons/md";
import { HiOutlineLightBulb, HiOutlineSparkles } from "react-icons/hi";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { IoMegaphoneOutline } from "react-icons/io5";
import { BsGraphUpArrow, BsChatQuote } from "react-icons/bs";

import "./marketing.scss";

// Seeded call text samples for marketing insights
const callSamples = [
  {
    id: 1,
    excerpt: "I heard about your summer promotion on Instagram and wanted to know more about the bundle deals...",
    sentiment: "positive",
    topics: ["Summer Promo", "Bundle Deals", "Instagram"],
    intent: "Purchase Inquiry",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    excerpt: "My friend recommended your premium plan, she said the family features are amazing...",
    sentiment: "positive",
    topics: ["Referral", "Premium Plan", "Family Features"],
    intent: "Upgrade Interest",
    timestamp: "3 hours ago",
  },
  {
    id: 3,
    excerpt: "I saw your competitor offering a 30% discount. Can you match that? I've been a customer for 3 years...",
    sentiment: "neutral",
    topics: ["Competitor Pricing", "Loyalty", "Discount Request"],
    intent: "Retention Risk",
    timestamp: "4 hours ago",
  },
  {
    id: 4,
    excerpt: "The mobile app notifications about flash sales are really helpful, I just bought two more items...",
    sentiment: "positive",
    topics: ["Mobile App", "Flash Sales", "Cross-sell"],
    intent: "Repeat Purchase",
    timestamp: "5 hours ago",
  },
  {
    id: 5,
    excerpt: "I'm confused about the pricing tiers. The website says one thing but the email said something different...",
    sentiment: "negative",
    topics: ["Pricing Confusion", "Website", "Email Marketing"],
    intent: "Clarification",
    timestamp: "6 hours ago",
  },
  {
    id: 6,
    excerpt: "Just saw your TikTok ad - the one with the dog? That was hilarious. Anyway, I need to upgrade...",
    sentiment: "positive",
    topics: ["TikTok", "Brand Awareness", "Upgrade"],
    intent: "Campaign Success",
    timestamp: "7 hours ago",
  },
];

interface TrendData {
  keyword: string;
  mentions: number;
  change: number;
  sentiment: "positive" | "negative" | "neutral";
  category: string;
}

const trendingTopics: TrendData[] = [
  { keyword: "Summer Promotion", mentions: 342, change: 45, sentiment: "positive", category: "Campaign" },
  { keyword: "Premium Upgrade", mentions: 287, change: 32, sentiment: "positive", category: "Product" },
  { keyword: "Mobile App", mentions: 256, change: 28, sentiment: "positive", category: "Channel" },
  { keyword: "Competitor Pricing", mentions: 198, change: -12, sentiment: "negative", category: "Competitive" },
  { keyword: "Family Plan", mentions: 176, change: 18, sentiment: "positive", category: "Product" },
  { keyword: "Referral Program", mentions: 154, change: 56, sentiment: "positive", category: "Campaign" },
];

interface CampaignRecord {
  key: string;
  name: string;
  channel: string;
  mentions: number;
  sentiment: number;
  conversions: number;
  roi: number;
  status: "active" | "ended" | "scheduled";
}

const campaignData: CampaignRecord[] = [
  { key: "1", name: "Summer Splash 2024", channel: "Multi-channel", mentions: 892, sentiment: 87, conversions: 234, roi: 320, status: "active" },
  { key: "2", name: "TikTok Viral Push", channel: "TikTok", mentions: 1256, sentiment: 92, conversions: 189, roi: 450, status: "active" },
  { key: "3", name: "Email Re-engagement", channel: "Email", mentions: 445, sentiment: 78, conversions: 156, roi: 280, status: "active" },
  { key: "4", name: "Referral Rewards", channel: "Word of Mouth", mentions: 678, sentiment: 95, conversions: 312, roi: 520, status: "active" },
  { key: "5", name: "Spring Clearance", channel: "Instagram", mentions: 534, sentiment: 82, conversions: 198, roi: 290, status: "ended" },
];

const columns: TableColumnsType<CampaignRecord> = [
  {
    title: "Campaign",
    dataIndex: "name",
    key: "name",
    render: (name: string, record: CampaignRecord) => (
      <Flex align="center" gap={12}>
        <div className={`campaign-icon campaign-icon--${record.channel.toLowerCase().replace(" ", "-")}`}>
          {record.channel === "Multi-channel" && <MdOutlineCampaign size={20} />}
          {record.channel === "TikTok" && <ThunderboltOutlined />}
          {record.channel === "Email" && <MessageOutlined />}
          {record.channel === "Word of Mouth" && <HeartOutlined />}
          {record.channel === "Instagram" && <StarOutlined />}
        </div>
        <div>
          <div className="campaign-name">{name}</div>
          <Tag color="default" className="channel-tag">{record.channel}</Tag>
        </div>
      </Flex>
    ),
  },
  {
    title: "Call Mentions",
    dataIndex: "mentions",
    key: "mentions",
    render: (val: number) => (
      <span className="fw-bold" style={{ fontSize: 15 }}>
        <BiMessageRoundedDetail style={{ marginRight: 4 }} />
        {val.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Sentiment",
    dataIndex: "sentiment",
    key: "sentiment",
    render: (val: number) => (
      <Progress
        type="circle"
        percent={val}
        size={42}
        strokeColor={val >= 85 ? "#52c41a" : val >= 70 ? "#faad14" : "#ff4d4f"}
        format={() => `${val}%`}
      />
    ),
  },
  {
    title: "Conversions",
    dataIndex: "conversions",
    key: "conversions",
    render: (val: number) => (
      <Flex align="center" gap={4}>
        <TrophyOutlined style={{ color: "#faad14" }} />
        <span className="fw-semibold">{val}</span>
      </Flex>
    ),
  },
  {
    title: "ROI",
    dataIndex: "roi",
    key: "roi",
    render: (val: number) => (
      <Tag color={val >= 400 ? "success" : val >= 300 ? "processing" : "default"} className="roi-tag">
        <RiseOutlined /> {val}%
      </Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Badge
        status={status === "active" ? "processing" : status === "ended" ? "default" : "warning"}
        text={<span className="text-capitalize">{status}</span>}
      />
    ),
  },
];

const Marketing = () => {
  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
  );

  const percentFormatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} decimals={1} suffix="%" />
  );

  // Campaign mentions over time
  const mentionsOptions: ApexCharts.ApexOptions = {
    chart: { type: "area", height: 300, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#eb2f96", "#722ed1", "#13c2c2"],
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
  };

  const mentionsSeries = [
    { name: "Summer Splash", data: [120, 145, 132, 178, 165, 142, 156] },
    { name: "TikTok Push", data: [180, 210, 195, 245, 230, 200, 220] },
    { name: "Referral Program", data: [85, 92, 98, 115, 108, 95, 102] },
  ];

  // Sentiment breakdown donut
  const sentimentOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", height: 260 },
    labels: ["Positive", "Neutral", "Negative"],
    colors: ["#52c41a", "#faad14", "#ff4d4f"],
    legend: { position: "bottom", labels: { colors: "#8c8c8c" } },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Overall",
              formatter: () => "78%",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  const sentimentSeries = [68, 22, 10];

  // Channel effectiveness radar
  const radarOptions: ApexCharts.ApexOptions = {
    chart: { type: "radar", height: 300, toolbar: { show: false } },
    colors: ["#722ed1", "#eb2f96"],
    stroke: { width: 2 },
    fill: { opacity: 0.2 },
    markers: { size: 4 },
    xaxis: {
      categories: ["Social", "Email", "Phone", "Referral", "Direct", "Ads"],
      labels: { style: { colors: "#8c8c8c", fontSize: "11px" } },
    },
    yaxis: { show: false },
    legend: { position: "bottom", labels: { colors: "#8c8c8c" } },
  };

  const radarSeries = [
    { name: "Mentions", data: [85, 72, 90, 78, 65, 70] },
    { name: "Conversions", data: [75, 68, 85, 92, 55, 62] },
  ];

  // Topic word cloud (simulated as bar chart)
  const wordCloudOptions: ApexCharts.ApexOptions = {
    chart: { type: "bar", height: 260, toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        distributed: true,
        barHeight: "70%",
      },
    },
    colors: ["#eb2f96", "#722ed1", "#13c2c2", "#fa8c16", "#52c41a", "#1890ff"],
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      formatter: (_: number, opt: { dataPointIndex: number }) => {
        const keywords = ["Summer Promo", "Premium", "Mobile", "Pricing", "Family", "Referral"];
        return keywords[opt.dataPointIndex];
      },
      offsetX: 5,
      style: { colors: ["#fff"], fontWeight: 600 },
    },
    xaxis: {
      labels: { show: false },
    },
    yaxis: { labels: { show: false } },
    legend: { show: false },
    grid: { show: false },
    tooltip: { enabled: false },
  };

  const wordCloudSeries = [{ data: [342, 287, 256, 198, 176, 154] }];

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
    <div className="marketing-page">
      <Row gutter={[24, 24]}>
        {/* Stats Cards */}
        <Col span={24}>
          <Flex gap={24}>
            <Card className="stat-card stat-card--gradient-pink w-100">
              <div className="stat-card__icon">
                <IoMegaphoneOutline size={28} />
              </div>
              <Statistic
                title="Campaign Mentions"
                value={3847}
                formatter={formatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +23%
                  </span>
                }
              />
              <div className="sassy-tagline">Your campaigns are having a moment</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#eb2f96"] }}
                series={[{ data: [2800, 3000, 3200, 3400, 3600, 3750, 3847] }]}
                type="area"
                height={60}
              />
            </Card>

            <Card className="stat-card stat-card--gradient-purple w-100">
              <div className="stat-card__icon stat-card__icon--purple">
                <BsGraphUpArrow size={26} />
              </div>
              <Statistic
                title="Conversion Rate"
                value={12.8}
                formatter={percentFormatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +2.4%
                  </span>
                }
              />
              <div className="sassy-tagline">Converting like it's your job... wait</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#722ed1"] }}
                series={[{ data: [8.5, 9.2, 10.1, 10.8, 11.5, 12.2, 12.8] }]}
                type="area"
                height={60}
              />
            </Card>

            <Card className="stat-card stat-card--gradient-teal w-100">
              <div className="stat-card__icon stat-card__icon--teal">
                <HiOutlineLightBulb size={28} />
              </div>
              <Statistic
                title="Unique Insights"
                value={156}
                formatter={formatter}
              />
              <div className="sassy-tagline">Big brain energy detected</div>
              <div className="insight-preview">
                <Tag color="magenta">Trending: Summer Promo</Tag>
              </div>
            </Card>

            <Card className="stat-card stat-card--gradient-orange w-100">
              <div className="stat-card__icon stat-card__icon--orange">
                <FireOutlined style={{ fontSize: 26 }} />
              </div>
              <Statistic
                title="Avg. Sentiment"
                value={78.4}
                formatter={percentFormatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +5%
                  </span>
                }
              />
              <div className="sassy-tagline">Customers are feeling the vibes</div>
              <ReactApexChart
                options={{ ...sparklineOptions, colors: ["#fa8c16"] }}
                series={[{ data: [70, 72, 74, 75, 76, 77, 78.4] }]}
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
                title={<><BiTrendingUp size={18} style={{ marginRight: 8 }} /> Campaign Mention Trends</>}
                className="chart-card"
                extra={<Tag color="magenta"><HiOutlineSparkles /> Live</Tag>}
              >
                <ReactApexChart options={mentionsOptions} series={mentionsSeries} type="area" height={300} />
              </Card>
            </Col>
            <Col span={7}>
              <Card title={<><MdOutlineInsights size={18} style={{ marginRight: 8 }} /> Sentiment Mix</>} className="chart-card">
                <ReactApexChart options={sentimentOptions} series={sentimentSeries} type="donut" height={280} />
                <div className="chart-sass">Mostly good vibes only</div>
              </Card>
            </Col>
            <Col span={7}>
              <Card title={<><TbBrandGoogleAnalytics size={18} style={{ marginRight: 8 }} /> Channel Radar</>} className="chart-card">
                <ReactApexChart options={radarOptions} series={radarSeries} type="radar" height={300} />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Trending & Call Insights */}
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card
                title={<><FireOutlined style={{ color: "#ff4d4f", marginRight: 8 }} /> Trending Topics</>}
                className="trending-card"
                extra={<Tag color="volcano">Hot</Tag>}
              >
                <ReactApexChart options={wordCloudOptions} series={wordCloudSeries} type="bar" height={260} />
                <div className="trending-sass">
                  <ThunderboltOutlined /> These keywords are eating
                </div>
              </Card>
            </Col>
            <Col span={16}>
              <Card
                title={<><BsChatQuote size={18} style={{ marginRight: 8 }} /> Live Call Insights</>}
                className="insights-card"
                extra={<Badge status="processing" text="Analyzing calls in real-time" />}
              >
                <List
                  dataSource={callSamples}
                  renderItem={(item) => (
                    <List.Item className="insight-item">
                      <div className="insight-content">
                        <div className="insight-quote">"{item.excerpt}"</div>
                        <Flex gap={8} wrap="wrap" style={{ marginTop: 8 }}>
                          {item.topics.map((topic) => (
                            <Tag key={topic} color="purple">{topic}</Tag>
                          ))}
                        </Flex>
                        <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
                          <Flex gap={12}>
                            <Tag
                              color={
                                item.sentiment === "positive" ? "success" :
                                item.sentiment === "negative" ? "error" : "warning"
                              }
                            >
                              {item.sentiment}
                            </Tag>
                            <span className="intent-badge">
                              <BulbOutlined /> {item.intent}
                            </span>
                          </Flex>
                          <span className="insight-time">{item.timestamp}</span>
                        </Flex>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Campaign Performance Table */}
        <Col span={24}>
          <Card
            title={<><MdOutlineCampaign style={{ marginRight: 8 }} /> Campaign Performance</>}
            className="table-card"
            extra={
              <Flex gap={8}>
                <Tag color="success"><RiseOutlined /> Avg ROI: 372%</Tag>
                <Tag color="processing"><MdAutoGraph size={14} /> AI-Tracked</Tag>
              </Flex>
            }
          >
            <Table
              columns={columns}
              dataSource={campaignData}
              pagination={false}
              className="campaigns-table"
            />
            <div className="table-sass">
              <HiOutlineSparkles /> These campaigns? Main character energy.
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Marketing;
