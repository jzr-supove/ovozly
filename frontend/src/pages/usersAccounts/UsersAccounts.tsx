import { Card, Col, Row, Flex, Table, Tag, Avatar, Button, Input, Select, Dropdown, Badge, Progress, Tooltip, Tabs, Statistic } from "antd";
import type { TableColumnsType, TabsProps, StatisticProps, MenuProps } from "antd";
import CountUp from "react-countup";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import {
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  MailOutlined,
  PhoneOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EllipsisOutlined,
  UserAddOutlined,
  SafetyOutlined,
  RiseOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { BiUser, BiUserCheck, BiUserX, BiShield } from "react-icons/bi";
import { HiOutlineUserGroup, HiOutlineShieldCheck } from "react-icons/hi";
import { FiActivity, FiUsers } from "react-icons/fi";

import "./usersAccounts.scss";

interface UserRecord {
  key: string;
  name: string;
  email: string;
  avatar: string;
  role: "Admin" | "Manager" | "Analyst" | "Viewer";
  department: string;
  status: "active" | "inactive" | "pending";
  lastActive: string;
  callsReviewed: number;
  joinDate: string;
}

const userData: UserRecord[] = [
  { key: "1", name: "Sarah Johnson", email: "sarah.j@company.com", avatar: "S", role: "Admin", department: "Operations", status: "active", lastActive: "Just now", callsReviewed: 1250, joinDate: "Jan 2023" },
  { key: "2", name: "Michael Chen", email: "m.chen@company.com", avatar: "M", role: "Manager", department: "Quality Assurance", status: "active", lastActive: "5 mins ago", callsReviewed: 890, joinDate: "Mar 2023" },
  { key: "3", name: "Emily Rodriguez", email: "e.rodriguez@company.com", avatar: "E", role: "Analyst", department: "Analytics", status: "active", lastActive: "1 hour ago", callsReviewed: 2340, joinDate: "Jun 2023" },
  { key: "4", name: "James Wilson", email: "j.wilson@company.com", avatar: "J", role: "Analyst", department: "Support", status: "inactive", lastActive: "2 days ago", callsReviewed: 560, joinDate: "Aug 2023" },
  { key: "5", name: "Amanda Foster", email: "a.foster@company.com", avatar: "A", role: "Viewer", department: "Training", status: "pending", lastActive: "Never", callsReviewed: 0, joinDate: "Dec 2024" },
  { key: "6", name: "David Kim", email: "d.kim@company.com", avatar: "D", role: "Manager", department: "Sales", status: "active", lastActive: "30 mins ago", callsReviewed: 1120, joinDate: "Feb 2023" },
  { key: "7", name: "Lisa Thompson", email: "l.thompson@company.com", avatar: "L", role: "Analyst", department: "Compliance", status: "active", lastActive: "2 hours ago", callsReviewed: 780, joinDate: "Sep 2023" },
  { key: "8", name: "Robert Martinez", email: "r.martinez@company.com", avatar: "R", role: "Viewer", department: "Operations", status: "active", lastActive: "1 day ago", callsReviewed: 145, joinDate: "Nov 2023" },
];

const roleColors: Record<string, string> = {
  Admin: "purple",
  Manager: "blue",
  Analyst: "cyan",
  Viewer: "default",
};

const roleIcons: Record<string, React.ReactNode> = {
  Admin: <CrownOutlined />,
  Manager: <TeamOutlined />,
  Analyst: <UserOutlined />,
  Viewer: <UserOutlined />,
};

const actionItems: MenuProps["items"] = [
  { key: "edit", label: "Edit User", icon: <EditOutlined /> },
  { key: "reset", label: "Reset Password", icon: <LockOutlined /> },
  { key: "permissions", label: "Manage Permissions", icon: <SafetyOutlined /> },
  { type: "divider" },
  { key: "deactivate", label: "Deactivate", icon: <CloseCircleOutlined />, danger: true },
];

const columns: TableColumnsType<UserRecord> = [
  {
    title: "User",
    key: "user",
    render: (_: unknown, record: UserRecord) => (
      <Flex align="center" gap={12}>
        <Avatar
          size={44}
          style={{
            background: `linear-gradient(135deg, ${
              record.role === "Admin" ? "#722ed1" : record.role === "Manager" ? "#1890ff" : record.role === "Analyst" ? "#13c2c2" : "#8c8c8c"
            } 0%, ${
              record.role === "Admin" ? "#9254de" : record.role === "Manager" ? "#40a9ff" : record.role === "Analyst" ? "#36cfc9" : "#bfbfbf"
            } 100%)`,
          }}
        >
          {record.avatar}
        </Avatar>
        <div>
          <div className="user-name">{record.name}</div>
          <div className="user-email">
            <MailOutlined /> {record.email}
          </div>
        </div>
      </Flex>
    ),
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    render: (role: string) => (
      <Tag color={roleColors[role]} icon={roleIcons[role]} className="role-tag">
        {role}
      </Tag>
    ),
    filters: [
      { text: "Admin", value: "Admin" },
      { text: "Manager", value: "Manager" },
      { text: "Analyst", value: "Analyst" },
      { text: "Viewer", value: "Viewer" },
    ],
    onFilter: (value, record) => record.role === value,
  },
  {
    title: "Department",
    dataIndex: "department",
    key: "department",
    render: (dept: string) => <span className="text-muted">{dept}</span>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const config: Record<string, { color: string; icon: React.ReactNode }> = {
        active: { color: "success", icon: <CheckCircleOutlined /> },
        inactive: { color: "default", icon: <CloseCircleOutlined /> },
        pending: { color: "warning", icon: <ClockCircleOutlined /> },
      };
      return (
        <Badge
          status={status === "active" ? "success" : status === "pending" ? "warning" : "default"}
          text={<span className="text-capitalize">{status}</span>}
        />
      );
    },
  },
  {
    title: "Last Active",
    dataIndex: "lastActive",
    key: "lastActive",
    render: (time: string) => <span className={time === "Just now" ? "text-success" : "text-muted"}>{time}</span>,
  },
  {
    title: "Calls Reviewed",
    dataIndex: "callsReviewed",
    key: "callsReviewed",
    sorter: (a, b) => a.callsReviewed - b.callsReviewed,
    render: (count: number) => <span className="fw-semibold">{count.toLocaleString()}</span>,
  },
  {
    title: "Joined",
    dataIndex: "joinDate",
    key: "joinDate",
    render: (date: string) => <span className="text-muted">{date}</span>,
  },
  {
    title: "",
    key: "actions",
    width: 50,
    render: () => (
      <Dropdown menu={{ items: actionItems }} trigger={["click"]} placement="bottomRight">
        <Button type="text" icon={<MoreOutlined />} />
      </Dropdown>
    ),
  },
];

interface TeamRecord {
  key: string;
  name: string;
  lead: string;
  members: number;
  activeNow: number;
  avgPerformance: number;
}

const teamsData: TeamRecord[] = [
  { key: "1", name: "Customer Support", lead: "Sarah Johnson", members: 12, activeNow: 8, avgPerformance: 92 },
  { key: "2", name: "Sales Team", lead: "David Kim", members: 8, activeNow: 6, avgPerformance: 88 },
  { key: "3", name: "Quality Assurance", lead: "Michael Chen", members: 5, activeNow: 4, avgPerformance: 95 },
  { key: "4", name: "Compliance", lead: "Lisa Thompson", members: 4, activeNow: 2, avgPerformance: 91 },
];

const UsersAccounts = () => {
  const formatter: StatisticProps["formatter"] = (value) => <CountUp end={value as number} separator="," />;

  // User activity chart
  const activityOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 280,
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
    colors: ["#1890ff", "#52c41a"],
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

  const activitySeries = [
    { name: "Active Users", data: [35, 42, 38, 45, 48, 22, 18] },
    { name: "New Signups", data: [5, 8, 3, 6, 4, 2, 1] },
  ];

  // Role distribution
  const roleDistOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", height: 280 },
    labels: ["Admin", "Manager", "Analyst", "Viewer"],
    colors: ["#722ed1", "#1890ff", "#13c2c2", "#8c8c8c"],
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
              label: "Total",
              formatter: () => "48",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  const roleDistSeries = [3, 8, 25, 12];

  // Teams panel
  const teamsPanel = (
    <Row gutter={[20, 20]}>
      {teamsData.map((team) => (
        <Col span={6} key={team.key}>
          <div className="team-card">
            <Flex justify="space-between" align="flex-start">
              <div>
                <div className="team-card__name">{team.name}</div>
                <div className="team-card__lead">Led by {team.lead}</div>
              </div>
              <Button type="text" icon={<SettingOutlined />} size="small" />
            </Flex>

            <Flex gap={24} className="team-card__stats">
              <div>
                <div className="team-card__stat-value">{team.members}</div>
                <div className="team-card__stat-label">Members</div>
              </div>
              <div>
                <div className="team-card__stat-value text-success">{team.activeNow}</div>
                <div className="team-card__stat-label">Active Now</div>
              </div>
            </Flex>

            <div className="team-card__performance">
              <Flex justify="space-between" className="mb-1">
                <span className="text-muted small">Avg Performance</span>
                <span className="fw-semibold">{team.avgPerformance}%</span>
              </Flex>
              <Progress
                percent={team.avgPerformance}
                showInfo={false}
                strokeColor={team.avgPerformance >= 90 ? "#52c41a" : "#faad14"}
                size="small"
              />
            </div>

            <Button block className="mt-3">
              View Team
            </Button>
          </div>
        </Col>
      ))}
    </Row>
  );

  const tabItems: TabsProps["items"] = [
    {
      key: "users",
      label: (
        <span>
          <UserOutlined /> All Users
        </span>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={userData}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="users-table"
        />
      ),
    },
    {
      key: "teams",
      label: (
        <span>
          <TeamOutlined /> Teams
        </span>
      ),
      children: teamsPanel,
    },
  ];

  return (
    <div className="users-accounts-page">
      <Row gutter={[24, 24]}>
        {/* Stats Cards */}
        <Col span={24}>
          <Flex gap={24}>
            <Card className="stat-card w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon stat-card__icon--users">
                  <FiUsers size={24} />
                </div>
                <div>
                  <div className="stat-card__label">Total Users</div>
                  <div className="stat-card__value">
                    <CountUp end={48} />
                  </div>
                </div>
              </Flex>
              <div className="stat-card__trend">
                <RiseOutlined /> +5 this month
              </div>
            </Card>

            <Card className="stat-card w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon stat-card__icon--active">
                  <BiUserCheck size={26} />
                </div>
                <div>
                  <div className="stat-card__label">Active Now</div>
                  <div className="stat-card__value stat-card__value--success">
                    <CountUp end={32} />
                  </div>
                </div>
              </Flex>
              <div className="stat-card__trend stat-card__trend--success">67% of team online</div>
            </Card>

            <Card className="stat-card w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon stat-card__icon--pending">
                  <ClockCircleOutlined style={{ fontSize: 24 }} />
                </div>
                <div>
                  <div className="stat-card__label">Pending Invites</div>
                  <div className="stat-card__value stat-card__value--warning">
                    <CountUp end={3} />
                  </div>
                </div>
              </Flex>
              <div className="stat-card__trend stat-card__trend--warning">Awaiting confirmation</div>
            </Card>

            <Card className="stat-card w-100">
              <Flex align="center" gap={16}>
                <div className="stat-card__icon stat-card__icon--teams">
                  <HiOutlineUserGroup size={24} />
                </div>
                <div>
                  <div className="stat-card__label">Teams</div>
                  <div className="stat-card__value">
                    <CountUp end={4} />
                  </div>
                </div>
              </Flex>
              <div className="stat-card__trend">29 total members</div>
            </Card>
          </Flex>
        </Col>

        {/* Charts Row */}
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card title="User Activity" extra={<EllipsisOutlined />} className="chart-card">
                <ReactApexChart options={activityOptions} series={activitySeries} type="area" height={280} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Role Distribution" extra={<EllipsisOutlined />} className="chart-card">
                <ReactApexChart options={roleDistOptions} series={roleDistSeries} type="donut" height={280} />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Users Table */}
        <Col span={24}>
          <Card
            className="users-card"
            title={
              <Flex align="center" gap={12}>
                <TeamOutlined />
                <span>User Management</span>
              </Flex>
            }
            extra={
              <Flex gap={12}>
                <Input placeholder="Search users..." prefix={<SearchOutlined />} style={{ width: 240 }} />
                <Select
                  placeholder="Filter by role"
                  style={{ width: 150 }}
                  allowClear
                  options={[
                    { value: "Admin", label: "Admin" },
                    { value: "Manager", label: "Manager" },
                    { value: "Analyst", label: "Analyst" },
                    { value: "Viewer", label: "Viewer" },
                  ]}
                />
                <Button icon={<DownloadOutlined />}>Export</Button>
                <Button type="primary" icon={<UserAddOutlined />}>
                  Add User
                </Button>
              </Flex>
            }
          >
            <Tabs defaultActiveKey="users" items={tabItems} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UsersAccounts;
