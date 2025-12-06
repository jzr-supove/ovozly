import { Layout, Menu, MenuProps, Space, theme } from "antd";

import { Notifications } from "../notifications/Notifications";
import UserAvatar from "../userAvatar/UserAvatar";
import Questions from "../questions/Questions";

import "./header.scss";
import logo from "@/assets/logo_2.png";

const { Header } = Layout;

const items: MenuProps["items"] = [
  { key: "home", label: "Home" },
  { key: "performance", label: "Performance" },
  { key: "solutions", label: "Solutions" },
  { key: "discovery", label: "Discovery" },
  { key: "search", label: "Search" },
];

const AppHeader = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Header
      style={{
        background: colorBgContainer,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "50px",
        paddingLeft: "16px",
      }}
    >
      <div className="demo-logo">
        <a
          href="#"
          className="d-flex justify-content-center gap-2 align-items-center py-2 py-lg-20 fs-4 "
        >
          <img
            alt="Logo"
            src={logo}
            style={{ width: "45px", height: "auto" }}
          />
          <span>Ovozly</span>
        </a>
      </div>
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["performance"]}
        items={items}
        style={{ flex: 1, minWidth: 0 }}
      />
      <Space wrap size={23}>
        <Notifications />
        <Questions />
        <UserAvatar />
      </Space>
    </Header>
  );
};

export default AppHeader;
