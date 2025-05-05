"use client"

import { useState } from "react"
import { Layout, Menu } from "antd"
import { FileSearchOutlined } from "@ant-design/icons"
import { Outlet, useNavigate } from "react-router-dom"

const { Sider, Content } = Layout

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleMenuSelect = ({ key }) => {
    if (key === "jobs") {
      navigate("/dashboard/jobs")
    }
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          selectedKeys={["jobs"]}
          mode="inline"
          onSelect={handleMenuSelect}
          items={[{ key: "jobs", icon: <FileSearchOutlined />, label: "Jobs" }]}
        />
      </Sider>
      <Layout className="site-layout">
        <Content style={{ margin: "0 16px" }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
