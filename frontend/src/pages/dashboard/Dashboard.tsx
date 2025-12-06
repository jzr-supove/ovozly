import React from "react";
import { Breadcrumb, Layout, theme } from "antd";
import { Outlet } from "react-router-dom";

import AppHeader from "@/components/header/AppHeader";
import Sidebar from "@/components/sidebar/Sidebar";

const Dashboard: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="layout">
      <AppHeader />

      <Layout>
        <Sidebar />
        <Layout style={{ padding: "0 24px 24px" }}>
          <div className="content-wrapper py-5 px-3 h-100">
            <Outlet />
          </div>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
