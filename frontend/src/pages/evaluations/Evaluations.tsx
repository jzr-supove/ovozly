import { Card, Col, Row, Flex, Statistic, Table, Tag, Progress, Badge, Avatar, Tooltip } from "antd";
import type { StatisticProps, TableColumnsType } from "antd";
import CountUp from "react-countup";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EllipsisOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  FallOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { BiTargetLock } from "react-icons/bi";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { MdOutlineAutoGraph } from "react-icons/md";

import "./evaluations.scss";

interface EvaluationRecord {
  key: string;
  name: string;
  type: string;
  status: "active" | "paused" | "completed";
  accuracy: number;
  evaluated: number;
  passed: number;
  failed: number;
  lastRun: string;
}

const evaluationData: EvaluationRecord[] = [
  { key: "1", name: "Compliance Check v2.1", type: "Auto", status: "active", accuracy: 94.2, evaluated: 1250, passed: 1178, failed: 72, lastRun: "2 mins ago" },
  { key: "2", name: "Sentiment Analysis", type: "AI", status: "active", accuracy: 89.7, evaluated: 3420, passed: 3068, failed: 352, lastRun: "5 mins ago" },
  { key: "3", name: "Script Adherence", type: "Hybrid", status: "paused", accuracy: 91.3, evaluated: 890, passed: 813, failed: 77, lastRun: "1 hour ago" },
  { key: "4", name: "Quality Assurance", type: "Manual", status: "completed", accuracy: 96.8, evaluated: 520, passed: 503, failed: 17, lastRun: "3 hours ago" },
  { key: "5", name: "Tone Detection", type: "AI", status: "active", accuracy: 87.4, evaluated: 2100, passed: 1835, failed: 265, lastRun: "10 mins ago" },
  { key: "6", name: "Resolution Tracking", type: "Auto", status: "active", accuracy: 92.1, evaluated: 1580, passed: 1455, failed: 125, lastRun: "15 mins ago" },
];

const columns: TableColumnsType<EvaluationRecord> = [
  {
    title: "Evaluation Name",
    dataIndex: "name",
    key: "name",
    render: (text: string, record: EvaluationRecord) => (
      <Flex align="center" gap={12}>
        <div className={`eval-icon eval-icon--${record.type.toLowerCase()}`}>
          {record.type === "Auto" && <ThunderboltOutlined />}
          {record.type === "AI" && <MdOutlineAutoGraph />}
          {record.type === "Hybrid" && <BiTargetLock />}
          {record.type === "Manual" && <HiOutlineClipboardCheck />}
        </div>
        <div>
          <div className="eval-name">{text}</div>
          <Tag color={record.type === "AI" ? "purple" : record.type === "Auto" ? "blue" : record.type === "Hybrid" ? "orange" : "default"} className="eval-type-tag">
            {record.type}
          </Tag>
        </div>
      </Flex>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Badge
        status={status === "active" ? "processing" : status === "paused" ? "warning" : "success"}
        text={<span className="text-capitalize">{status}</span>}
      />
    ),
  },
  {
    title: "Accuracy",
    dataIndex: "accuracy",
    key: "accuracy",
    render: (accuracy: number) => (
      <Flex align="center" gap={8}>
        <Progress
          type="circle"
          percent={accuracy}
          size={40}
          strokeColor={accuracy >= 90 ? "#52c41a" : accuracy >= 80 ? "#faad14" : "#ff4d4f"}
          format={() => `${accuracy}%`}
        />
      </Flex>
    ),
  },
  {
    title: "Evaluated",
    dataIndex: "evaluated",
    key: "evaluated",
    render: (val: number) => <span className="fw-semibold">{val.toLocaleString()}</span>,
  },
  {
    title: "Passed / Failed",
    key: "passedFailed",
    render: (_: unknown, record: EvaluationRecord) => (
      <Flex gap={16}>
        <span className="text-success">
          <CheckCircleOutlined /> {record.passed.toLocaleString()}
        </span>
        <span className="text-danger">
          <CloseCircleOutlined /> {record.failed.toLocaleString()}
        </span>
      </Flex>
    ),
  },
  {
    title: "Last Run",
    dataIndex: "lastRun",
    key: "lastRun",
    render: (time: string) => (
      <span className="text-muted">
        <ClockCircleOutlined /> {time}
      </span>
    ),
  },
];

const Evaluations = () => {
  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
  );

  const percentFormatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} decimals={1} suffix="%" />
  );

  // Trend chart options
  const trendOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 80,
      sparkline: { enabled: true },
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    colors: ["#1890ff"],
    tooltip: { enabled: false },
  };

  // Accuracy over time chart
  const accuracyChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#722ed1", "#13c2c2", "#52c41a"],
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: { style: { colors: "#8c8c8c" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}%`,
        style: { colors: "#8c8c8c" },
      },
      min: 80,
      max: 100,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#8c8c8c" },
    },
    grid: { borderColor: "#f0f0f0" },
    tooltip: {
      y: { formatter: (val: number) => `${val}%` },
    },
  };

  const accuracySeries = [
    { name: "AI Models", data: [92, 94, 91, 95, 93, 96, 94] },
    { name: "Auto Rules", data: [88, 89, 90, 88, 91, 90, 92] },
    { name: "Overall", data: [90, 91, 90, 92, 92, 93, 93] },
  ];

  // Evaluation distribution donut
  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", height: 280 },
    labels: ["Passed", "Failed", "Pending"],
    colors: ["#52c41a", "#ff4d4f", "#faad14"],
    legend: {
      position: "bottom",
      labels: { colors: "#8c8c8c" },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => "9,760",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  const donutSeries = [8852, 908, 520];

  // Heatmap for evaluation activity
  const heatmapOptions: ApexCharts.ApexOptions = {
    chart: { type: "heatmap", height: 280, toolbar: { show: false } },
    dataLabels: { enabled: false },
    colors: ["#1890ff"],
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: { style: { colors: "#8c8c8c" } },
    },
    yaxis: {
      labels: { style: { colors: "#8c8c8c" } },
    },
    plotOptions: {
      heatmap: {
        radius: 4,
        colorScale: {
          ranges: [
            { from: 0, to: 20, color: "#e6f7ff", name: "Low" },
            { from: 21, to: 50, color: "#69c0ff", name: "Medium" },
            { from: 51, to: 100, color: "#1890ff", name: "High" },
          ],
        },
      },
    },
  };

  const heatmapSeries = [
    { name: "00:00-06:00", data: [10, 15, 12, 18, 20, 5, 8] },
    { name: "06:00-12:00", data: [45, 52, 48, 55, 60, 25, 30] },
    { name: "12:00-18:00", data: [80, 85, 78, 90, 88, 40, 35] },
    { name: "18:00-24:00", data: [35, 40, 38, 42, 45, 15, 12] },
  ];

  return (
    <div className="evaluations-page">
      <Row gutter={[24, 24]}>
        {/* Stats Cards */}
        <Col span={24}>
          <Flex gap={24}>
            <Card className="stat-card stat-card--primary w-100">
              <div className="stat-card__icon">
                <BiTargetLock size={28} />
              </div>
              <Statistic
                title="Total Evaluations"
                value={9760}
                formatter={formatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +12%
                  </span>
                }
              />
              <ReactApexChart options={trendOptions} series={[{ data: [30, 40, 35, 50, 49, 60, 70, 91, 85] }]} type="area" height={60} />
            </Card>

            <Card className="stat-card stat-card--success w-100">
              <div className="stat-card__icon stat-card__icon--success">
                <CheckCircleOutlined style={{ fontSize: 28 }} />
              </div>
              <Statistic
                title="Pass Rate"
                value={90.7}
                formatter={percentFormatter}
                suffix={
                  <span className="stat-trend stat-trend--up">
                    <RiseOutlined /> +2.3%
                  </span>
                }
              />
              <ReactApexChart
                options={{ ...trendOptions, colors: ["#52c41a"] }}
                series={[{ data: [85, 87, 88, 86, 90, 89, 91, 90, 91] }]}
                type="area"
                height={60}
              />
            </Card>

            <Card className="stat-card stat-card--warning w-100">
              <div className="stat-card__icon stat-card__icon--warning">
                <ClockCircleOutlined style={{ fontSize: 28 }} />
              </div>
              <Statistic
                title="Avg. Processing Time"
                value={1.2}
                suffix={
                  <span>
                    s
                    <span className="stat-trend stat-trend--down ms-2">
                      <FallOutlined /> -0.3s
                    </span>
                  </span>
                }
              />
              <ReactApexChart
                options={{ ...trendOptions, colors: ["#faad14"] }}
                series={[{ data: [2.1, 1.9, 1.8, 1.7, 1.5, 1.4, 1.3, 1.2, 1.2] }]}
                type="area"
                height={60}
              />
            </Card>

            <Card className="stat-card stat-card--danger w-100">
              <div className="stat-card__icon stat-card__icon--danger">
                <FireOutlined style={{ fontSize: 28 }} />
              </div>
              <Statistic
                title="Critical Failures"
                value={23}
                formatter={formatter}
                suffix={
                  <span className="stat-trend stat-trend--down">
                    <FallOutlined /> -8
                  </span>
                }
              />
              <ReactApexChart
                options={{ ...trendOptions, colors: ["#ff4d4f"] }}
                series={[{ data: [45, 42, 38, 35, 30, 28, 25, 24, 23] }]}
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
              <Card title="Accuracy Trends" extra={<EllipsisOutlined />} className="chart-card">
                <ReactApexChart options={accuracyChartOptions} series={accuracySeries} type="line" height={300} />
              </Card>
            </Col>
            <Col span={7}>
              <Card title="Evaluation Distribution" extra={<EllipsisOutlined />} className="chart-card">
                <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={300} />
              </Card>
            </Col>
            <Col span={7}>
              <Card title="Activity Heatmap" extra={<EllipsisOutlined />} className="chart-card">
                <ReactApexChart options={heatmapOptions} series={heatmapSeries} type="heatmap" height={300} />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Evaluations Table */}
        <Col span={24}>
          <Card title="Active Evaluations" extra={<EllipsisOutlined />} className="table-card">
            <Table
              columns={columns}
              dataSource={evaluationData}
              pagination={false}
              className="evaluations-table"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Evaluations;
