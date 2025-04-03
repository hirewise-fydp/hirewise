'use client';

import React, { useState } from 'react';
import { Layout, Menu, Typography, Row, Col, Card, Statistic, Button, Table, Switch, Input, Tabs } from 'antd';
import {
  UserOutlined,
  FileSearchOutlined,
  SettingOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

// STATIC DATA
const statsData = [
  { title: "Total Applications", value: 1234, icon: <UserOutlined /> },
  { title: "Active Jobs", value: 23, icon: <FileSearchOutlined />},
  { title: "Paused Jobs", value: 4, icon: <FileSearchOutlined /> },
  { title: "Top Candidates", value: 45, icon: <UserOutlined /> }
];

const jobData = [
  { id: 1, title: "Frontend Developer", status: "Open", applicants: 25 },
  { id: 2, title: "Backend Developer", status: "Closed", applicants: 18 }
];

const applicantData = [
  { id: 1, jobId: 1, name: "John Doe", status: "Screened", score: "85%" },
  { id: 2, jobId: 1, name: "Jane Smith", status: "Tested", score: "92%" },
  { id: 3, jobId: 2, name: "Bob Johnson", status: "Rejected", score: "60%" }
];

// COMPONENTS
const DashboardView = () => (
  <>
    <Title level={2}>HR Dashboard</Title>
    <Row gutter={[16, 16]}>
      {statsData.map((stat, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card>
            <Statistic 
              title={stat.title}
              value={stat.value}
              prefix={stat.icon}
            />
          </Card>
        </Col>
      ))}
    </Row>
  </>
);

const JobsList = ({ onManageJob }) => {
  const columns = [
    { title: "Job Title", dataIndex: "title", key: "title" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Applicants", dataIndex: "applicants", key: "applicants" },
    { 
      title: "Action", 
      key: "action", 
      render: (_, record) => (
        <Button type="link" onClick={() => onManageJob(record.id)}>
          Manage
        </Button>
      )
    }
  ];

  return (
    <Card 
      title="Posted Jobs" 
      extra={<Button type="primary" icon={<PlusOutlined />}>Create New Job</Button>}
    >
      <Table columns={columns} dataSource={jobData} rowKey="id" />
    </Card>
  );
};

const ApplicationsView = ({ jobId, onBack }) => {
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "AI Score", dataIndex: "score", key: "score" },
    { title: "Action", key: "action", render: () => <Button type="link">View</Button> }
  ];

  const filteredData = jobId 
    ? applicantData.filter(app => app.jobId === jobId)
    : applicantData;

  // Group by job if no specific job selected
  const groupedData = !jobId && jobData.map(job => ({
    job: job.title,
    applications: applicantData.filter(app => app.jobId === job.id)
  }));

  return (
    <Card 
      title={jobId ? `Applications for ${jobData.find(j => j.id === jobId)?.title}` : "All Applications"}
      extra={jobId && <Button onClick={onBack}>Back to Jobs</Button>}
    >
      {!jobId && groupedData.map(group => (
        <div key={group.job} style={{ marginBottom: 24 }}>
          <Title level={5}>{group.job}</Title>
          <Table 
            columns={columns} 
            dataSource={group.applications} 
            pagination={false}
            rowKey="id"
          />
        </div>
      ))}

      {jobId && <Table columns={columns} dataSource={filteredData} rowKey="id" />}
    </Card>
  );
};

const SettingsView = () => (
  <Card>
    {jobData.map((job) => (
      <div key={job.id} style={{ marginBottom: 15, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
        <Title level={4}>{job.title}</Title>
        <Row justify="space-between" align="middle" style={{ marginTop: 5 }}>
          <Col>CV Screening</Col>
          <Col><Switch /></Col>
        </Row>
        <Row justify="space-between" align="middle" style={{ marginTop: 5 }}>
          <Col>Automated Testing</Col>
          <Col><Switch /></Col>
        </Row>
      </div>
    ))}
  </Card>
);

// MAIN COMPONENT
export default function HRDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState(null);

  const handleMenuSelect = ({ key }) => {
    setActiveView(key);
    setSelectedJob(null); // Reset job selection when changing views
  };

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'jobs':
        return selectedJob 
          ? <ApplicationsView jobId={selectedJob} onBack={() => setSelectedJob(null)} />
          : <JobsList onManageJob={setSelectedJob} />;
      case 'applications':
        return <ApplicationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" />
        <Menu 
          theme="dark" 
          defaultSelectedKeys={['dashboard']} 
          mode="inline"
          onSelect={handleMenuSelect}
          items={[
            {
              key: 'dashboard',
              icon: <UserOutlined />,
              label: 'Dashboard',
            },
            {
              key: 'jobs',
              icon: <FileSearchOutlined />,
              label: 'Jobs',
            },
            {
              key: 'applications',
              icon: <ProfileOutlined />, // Changed to differentiate from jobs
              label: 'Applications',
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: 'Settings',
            },
          ]}
        >

        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }} />
        <Content style={{ margin: '0 16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}