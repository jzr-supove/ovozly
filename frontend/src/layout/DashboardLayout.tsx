import React from "react";

import { Layout, theme } from "antd";
import AppHeader from "@/components/header/AppHeader";
import Sidebar from "@/components/sidebar/Sidebar";

const { Content } = Layout;

const DashboardLayout: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="layout">
      <AppHeader />

      <Layout>
        <Sidebar />
        <Layout style={{ padding: "0 24px 24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            Content
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
