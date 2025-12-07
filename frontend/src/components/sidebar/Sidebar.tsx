import { useState } from "react";
import { Button, Layout, Menu } from "antd";
import type { MenuProps } from "antd";

import {
  UserOutlined,
  LeftOutlined,
  RightOutlined,
  BarChartOutlined,
  FormOutlined,
  SyncOutlined,
  LinkOutlined,
  SettingOutlined,
  OrderedListOutlined,
  VerticalAlignTopOutlined,
  TeamOutlined,
  SafetyOutlined,
  RocketOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";

import "./sidebar.scss";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;
type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    label: "INSIGHTS",
    type: "group",
    children: [
      {
        key: "analytics",
        label: "Analytics",
        icon: <BarChartOutlined />,
      },
      {
        key: "calls",
        label: "Calls List",
        icon: <OrderedListOutlined />,
      },
      {
        key: "agents",
        label: "Agents",
        icon: <TeamOutlined />,
      },
      {
        key: "satisfaction",
        label: "Satisfaction",
        icon: <SmileOutlined />,
      },
    ],
  },
  {
    key: "intelligence",
    label: "INTELLIGENCE",
    type: "group",
    children: [
      {
        key: "compliance",
        label: "Compliance",
        icon: <SafetyOutlined />,
      },
      {
        key: "marketing",
        label: "Marketing",
        icon: <RocketOutlined />,
      },
    ],
  },
  {
    key: "applications",
    label: "APPLICATIONS",
    type: "group",
    children: [
      {
        key: "applications/evaluations",
        label: "Evaluations",
        icon: <FormOutlined />,
      },
      {
        key: "applications/post-processing",
        label: "Post Processing",
        icon: <SyncOutlined />,
      },
    ],
  },
  {
    key: "administration",
    label: "ADMINISTRATION",
    type: "group",
    children: [
      {
        key: "administration/integration",
        label: "Integration",
        icon: <LinkOutlined />,
      },
      {
        key: "administration/configuration",
        label: "Configuration",
        icon: <SettingOutlined />,
      },
      {
        key: "administration/users-accounts",
        label: "Users & Accounts",
        icon: <UserOutlined />,
      },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onClick: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
  };
  return (
    <Sider
      width={200}
      style={{ background: "#f5f5f5" }}
      collapsible
      trigger={null}
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="sidebar"
    >
      <Button
        onClick={toggleCollapsed}
        style={{ right: collapsed ? "-23%" : "-10%", padding: "11px" }}
        className="sidebar-collapse-btn fs-1"
      >
        {collapsed ? (
          // <VerticalAlignTopOutlined
          //   className="text-muted"
          //   style={{ transform: "rotate(90deg)" }}
          // />
          <AiOutlineMenuUnfold style={{ fontSize: "40px" }} size={32} />
        ) : (
          // <VerticalAlignTopOutlined
          //   className="text-muted"
          //   style={{ transform: "rotate(-90deg)" }}
          // />
          <AiOutlineMenuFold style={{ fontSize: "40px" }} size={32} />
        )}
      </Button>

      <Menu
        mode="inline"
        defaultSelectedKeys={[location.pathname.replace("/", "")]}
        // defaultOpenKeys={["analytics"]}
        inlineCollapsed={collapsed}
        style={{ height: "100%", borderRight: 0 }}
        items={items}
        onClick={onClick}
      />
    </Sider>
  );
};
//   <RightOutlined className="text-muted" />
//  <LeftOutlined className="text-muted" />
export default Sidebar;
