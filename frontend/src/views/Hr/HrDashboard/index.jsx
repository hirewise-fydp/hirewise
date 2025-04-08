import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  FileSearchOutlined,
  SettingOutlined
} from '@ant-design/icons';
import DashboardView from '../../../components/HRDashboard/DashboardView';
import JobsList from '../../../components/HRDashboard/JobsList';
import ApplicationsView from '../../../components/HRDashboard/ApplicationsView';
import SettingsView from '../../../components/HRDashboard/SettingsView';

const { Sider, Content } = Layout;

export default function HRDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedJobId, setSelectedJobId] = useState(null);

  const handleMenuSelect = ({ key }) => {
    setActiveView(key);
    setSelectedJobId(null);
  };

  const handleManageJob = (jobId) => {
    setSelectedJobId(jobId);
    setActiveView('applications');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'jobs':
        return <JobsList onManageJob={handleManageJob} />;
      case 'applications':
        return <ApplicationsView jobId={selectedJobId} onBack={() => setSelectedJobId(null)} />;
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
          selectedKeys={[activeView]}
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