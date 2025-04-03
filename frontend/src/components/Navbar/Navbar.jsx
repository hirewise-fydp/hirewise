"use client"

import React from "react"
import { Layout, Menu, Typography, Avatar, Dropdown, Space } from "antd"
import { UserOutlined, LogoutOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logoutUser } from "../../slices/authSlice"

const { Header } = Layout
const { Title } = Typography

const Navbar = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user) // Get user from Redux store

  const handleLogout = () => {
    dispatch(logoutUser()) 
  }

  const profileMenu = {
    items: [
      user && {
        key: "username",
        label: (
          <span>
            <UserOutlined /> {user.name || "User"}
          </span>
        ),
        disabled: true
      },
      {
        key: "createJob",
        label: (
          <span>
            <PlusOutlined /> Create Job
          </span>
        )
      },
      {
        key: "editJob",
        label: (
          <span>
            <EditOutlined /> Edit Job
          </span>
        )
      },
      {
        key: "logout",
        label: (
          <span onClick={handleLogout}>
            <LogoutOutlined /> Logout
          </span>
        )
      }
    ].filter(Boolean) // Remove `null` values if `user` is null
  }

  return (
    <Header style={{ display: "flex", alignItems: "center", padding: "0 24px" }}>
      <Title level={3} style={{ margin: 0, marginRight: "auto", color: "white" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          Hirewise
        </Link>
      </Title>
      <Menu theme="dark" mode="horizontal" selectable={false} items={[
        { key: "dashboard", label: <Link to="/hr/dashboard">Dashboard</Link> },
        { key: "jobs", label: <Link to="/jobs">Jobs</Link> }
      ]} />
      {user && (
        <Dropdown menu={profileMenu} trigger={["click"]}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <Avatar icon={<UserOutlined />} />
            </Space>
          </a>
        </Dropdown>
      )}
    </Header>
  )
}

export default Navbar
