import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  FileSearchOutlined,
  SettingOutlined
} from '@ant-design/icons';
import DashboardView from './DashboardView';
import JobsList from './JobsList';
import ApplicationsView from './ApplicationsView';
import SettingsView from './SettingsView';

const { Sider, Content } = Layout;

export default function HRDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState(null);

  const handleMenuSelect = ({ key }) => {
    setActiveView(key);
    setSelectedJob(null);
  };

  const renderContent = () => {
    switch (activeView) {
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
            { key: 'dashboard', icon: <UserOutlined />, label: 'Dashboard' },
            { key: 'jobs', icon: <FileSearchOutlined />, label: 'Jobs' },
            { key: 'applications', icon: <FileSearchOutlined />, label: 'Applications' },
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' }
          ]}
        />

      </Sider>
      <Layout className="site-layout">
        <Content style={{ margin: '0 16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}