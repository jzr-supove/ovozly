import { Card, Col, Row, Flex, Statistic, Table, Tag, Progress, Timeline, Steps, Avatar, Button, Switch } from "antd";
import type { StatisticProps, TableColumnsType } from "antd";
import CountUp from "react-countup";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PauseCircleOutlined,
  EllipsisOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { BiCog, BiData } from "react-icons/bi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { MdOutlineTransform, MdOutlineDataObject } from "react-icons/md";
import { FiLayers, FiZap } from "react-icons/fi";

import "./postProcessing.scss";

interface PipelineRecord {
  key: string;
  name: string;
  steps: number;
  status: "running" | "paused" | "completed" | "failed";
  progress: number;
  processed: number;
  queued: number;
  avgTime: string;
  throughput: string;
}

const pipelineData: PipelineRecord[] = [
  { key: "1", name: "Transcription Enhancement", steps: 4, status: "running", progress: 67, processed: 2340, queued: 1120, avgTime: "2.3s", throughput: "45/min" },
  { key: "2", name: "Sentiment Tagging", steps: 3, status: "running", progress: 82, processed: 5620, queued: 890, avgTime: "1.1s", throughput: "85/min" },
  { key: "3", name: "Entity Extraction", steps: 5, status: "paused", progress: 45, processed: 1890, queued: 2340, avgTime: "3.5s", throughput: "28/min" },
  { key: "4", name: "Summary Generation", steps: 6, status: "completed", progress: 100, processed: 3450, queued: 0, avgTime: "4.2s", throughput: "22/min" },
  { key: "5", name: "Compliance Flagging", steps: 3, status: "running", progress: 91, processed: 4560, queued: 234, avgTime: "0.8s", throughput: "120/min" },
  { key: "6", name: "Quality Scoring", steps: 4, status: "failed", progress: 23, processed: 890, queued: 3450, avgTime: "2.8s", throughput: "0/min" },
];

const columns: TableColumnsType<PipelineRecord> = [
  {
    title: "Pipeline",
    dataIndex: "name",
    key: "name",
    render: (text: string, record: PipelineRecord) => (
      <Flex align="center" gap={12}>
        <div className={`pipeline-icon pipeline-icon--${record.status}`}>
          {record.status === "running" && <SyncOutlined spin />}
          {record.status === "paused" && <PauseCircleOutlined />}
          {record.status === "completed" && <CheckCircleOutlined />}
          {record.status === "failed" && <CloseCircleOutlined />}
        </div>
        <div>
          <div className="pipeline-name">{text}</div>
          <span className="text-muted small">{record.steps} steps</span>
        </div>
      </Flex>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const colors: Record<string, string> = {
        running: "processing",
        paused: "warning",
        completed: "success",
        failed: "error",
      };
      return (
        <Tag color={colors[status]} className="status-tag">
          {status === "running" && <LoadingOutlined spin className="me-1" />}
          <span className="text-capitalize">{status}</span>
        </Tag>
      );
    },
  },
  {
    title: "Progress",
    dataIndex: "progress",
    key: "progress",
    render: (progress: number, record: PipelineRecord) => (
      <Flex align="center" gap={12} style={{ minWidth: 150 }}>
        <Progress
          percent={progress}
          size="small"
          strokeColor={record.status === "failed" ? "#ff4d4f" : undefined}
          status={record.status === "failed" ? "exception" : undefined}
        />
      </Flex>
    ),
  },
  {
    title: "Processed",
    dataIndex: "processed",
    key: "processed",
    render: (val: number) => <span className="fw-semibold text-success">{val.toLocaleString()}</span>,
  },
  {
    title: "Queued",
    dataIndex: "queued",
    key: "queued",
    render: (val: number) => <span className="fw-semibold text-warning">{val.toLocaleString()}</span>,
  },
  {
    title: "Avg Time",
    dataIndex: "avgTime",
    key: "avgTime",
  },
  {
    title: "Throughput",
    dataIndex: "throughput",
    key: "throughput",
    render: (val: string) => <Tag color="blue">{val}</Tag>,
  },
  {
    title: "Actions",
    key: "actions",
    render: (_: unknown, record: PipelineRecord) => (
      <Flex gap={8}>
        {record.status === "running" ? (
          <Button size="small" icon={<PauseCircleOutlined />} />
        ) : (
          <Button size="small" type="primary" icon={<PlayCircleOutlined />} />
        )}
      </Flex>
    ),
  },
];

const PostProcessing = () => {
  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
  );

  // Real-time processing chart
  const realtimeOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 300,
      toolbar: { show: false },
      animations: {
        enabled: true,
        dynamicAnimation: { enabled: true, speed: 1000 },
      },
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
    colors: ["#1890ff", "#52c41a"],
    xaxis: {
      categories: ["10s", "20s", "30s", "40s", "50s", "60s", "70s", "80s", "90s", "100s"],
      labels: { style: { colors: "#8c8c8c" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}`,
        style: { colors: "#8c8c8c" },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#8c8c8c" },
    },
    grid: { borderColor: "#f0f0f0" },
  };

  const realtimeSeries = [
    { name: "Processed", data: [45, 52, 48, 61, 55, 67, 72, 68, 75, 82] },
    { name: "Queued", data: [120, 115, 108, 95, 88, 82, 75, 70, 65, 58] },
  ];

  // Pipeline throughput bar chart
  const throughputOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 280,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "60%",
        distributed: true,
      },
    },
    colors: ["#1890ff", "#52c41a", "#faad14", "#13c2c2", "#722ed1", "#eb2f96"],
    xaxis: {
      categories: ["Transcription", "Sentiment", "Entity", "Summary", "Compliance", "Quality"],
      labels: { style: { colors: "#8c8c8c" } },
    },
    yaxis: {
      labels: { style: { colors: "#8c8c8c" } },
    },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}/min`,
      style: { colors: ["#fff"] },
    },
    grid: { borderColor: "#f0f0f0" },
  };

  const throughputSeries = [{ data: [45, 85, 28, 22, 120, 0] }];

  // Resource usage radial
  const resourceOptions: ApexCharts.ApexOptions = {
    chart: { type: "radialBar", height: 280 },
    plotOptions: {
      radialBar: {
        hollow: { size: "50%" },
        track: { background: "#f0f0f0" },
        dataLabels: {
          name: { fontSize: "14px", color: "#8c8c8c" },
          value: {
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--bs-gray-700)",
          },
        },
      },
    },
    labels: ["CPU", "Memory", "GPU"],
    colors: ["#1890ff", "#52c41a", "#722ed1"],
    legend: {
      show: true,
      position: "bottom",
      labels: { colors: "#8c8c8c" },
    },
  };

  const resourceSeries = [68, 45, 82];

  return (
    <div className="post-processing-page">
      <Row gutter={[24, 24]}>
        {/* Stats Cards */}
        <Col span={24}>
          <Flex gap={24}>
            <Card className="stat-card stat-card--gradient-blue w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon-lg">
                  <RocketOutlined />
                </div>
                <div>
                  <div className="stat-card__label">Active Pipelines</div>
                  <div className="stat-card__value">
                    <CountUp end={4} /> <span className="stat-card__suffix">/ 6</span>
                  </div>
                </div>
              </Flex>
              <div className="stat-card__bar">
                <div className="stat-card__bar-fill" style={{ width: "66%" }} />
              </div>
            </Card>

            <Card className="stat-card stat-card--gradient-green w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon-lg">
                  <DatabaseOutlined />
                </div>
                <div>
                  <div className="stat-card__label">Total Processed</div>
                  <div className="stat-card__value">
                    <CountUp end={18750} separator="," />
                  </div>
                </div>
              </Flex>
              <div className="stat-card__trend">
                <ThunderboltOutlined /> +2,340 today
              </div>
            </Card>

            <Card className="stat-card stat-card--gradient-orange w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon-lg">
                  <CloudUploadOutlined />
                </div>
                <div>
                  <div className="stat-card__label">Queue Depth</div>
                  <div className="stat-card__value">
                    <CountUp end={8034} separator="," />
                  </div>
                </div>
              </Flex>
              <div className="stat-card__trend stat-card__trend--warning">
                <SyncOutlined spin /> Processing...
              </div>
            </Card>

            <Card className="stat-card stat-card--gradient-purple w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon-lg">
                  <ApiOutlined />
                </div>
                <div>
                  <div className="stat-card__label">Throughput</div>
                  <div className="stat-card__value">
                    <CountUp end={342} /> <span className="stat-card__suffix">/min</span>
                  </div>
                </div>
              </Flex>
              <div className="stat-card__trend stat-card__trend--success">
                <FiZap /> Peak performance
              </div>
            </Card>
          </Flex>
        </Col>

        {/* Processing Flow Visualization */}
        <Col span={24}>
          <Card title="Processing Pipeline Flow" extra={<EllipsisOutlined />} className="flow-card">
            <div className="pipeline-flow">
              <div className="pipeline-step pipeline-step--active">
                <div className="pipeline-step__icon">
                  <BiData />
                </div>
                <div className="pipeline-step__label">Ingest</div>
                <div className="pipeline-step__count">8,034</div>
              </div>
              <div className="pipeline-arrow" />
              <div className="pipeline-step pipeline-step--active">
                <div className="pipeline-step__icon">
                  <MdOutlineTransform />
                </div>
                <div className="pipeline-step__label">Transform</div>
                <div className="pipeline-step__count">6,890</div>
              </div>
              <div className="pipeline-arrow" />
              <div className="pipeline-step pipeline-step--active">
                <div className="pipeline-step__icon">
                  <FiLayers />
                </div>
                <div className="pipeline-step__label">Enrich</div>
                <div className="pipeline-step__count">5,240</div>
              </div>
              <div className="pipeline-arrow" />
              <div className="pipeline-step pipeline-step--active">
                <div className="pipeline-step__icon">
                  <MdOutlineDataObject />
                </div>
                <div className="pipeline-step__label">Analyze</div>
                <div className="pipeline-step__count">3,890</div>
              </div>
              <div className="pipeline-arrow" />
              <div className="pipeline-step">
                <div className="pipeline-step__icon">
                  <HiOutlineDocumentReport />
                </div>
                <div className="pipeline-step__label">Output</div>
                <div className="pipeline-step__count">2,340</div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Charts Row */}
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col span={10}>
              <Card title="Real-time Processing" extra={<EllipsisOutlined />} className="chart-card">
                <ReactApexChart options={realtimeOptions} series={realtimeSeries} type="area" height={280} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Pipeline Throughput" extra={<EllipsisOutlined />} className="chart-card">
                <ReactApexChart options={throughputOptions} series={throughputSeries} type="bar" height={280} />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Resource Usage" extra={<EllipsisOutlined />} className="chart-card">
                <ReactApexChart options={resourceOptions} series={resourceSeries} type="radialBar" height={280} />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Pipeline Table */}
        <Col span={24}>
          <Card title="Pipeline Status" extra={<EllipsisOutlined />} className="table-card">
            <Table
              columns={columns}
              dataSource={pipelineData}
              pagination={false}
              className="pipeline-table"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PostProcessing;
