import React, { useState } from 'react';
import { Button, Card, Table, Typography, Alert, Switch, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import useApplications from '../../hooks/useApplications';
import useJobs from '../../hooks/useJobs';
import axiosInstance from '../../axios/AxiosInstance';

const { Title } = Typography;

export default function ApplicationsView({ jobId, onBack }) {
  const { applications, loading, error } = useApplications(jobId);
  const { jobs } = useJobs();
  const navigate = useNavigate();
  const [switchLoading, setSwitchLoading] = useState(false);

  const job = jobs.find(j => j._id === jobId);
  const jobTitle = job?.jobTitle || 'Job';
  const isAutomatedTestingEnabled = job?.modules?.automatedTesting || false;

  const handleSwitchChange = async (checked) => {
    if (checked) {
      try {
        setSwitchLoading(true);
        const modules = { ...job.modules, automatedTesting: true };
        await axiosInstance.put(`/api/v4/hr/updateJob/${jobId}`, { modules });
        message.success('Automated testing enabled successfully');
        navigate('/create-test');
      } catch (err) {
        message.error(err.response?.data?.message || 'Failed to enable automated testing');
        console.error('Error updating job modules:', err);
      } finally {
        setSwitchLoading(false);
      }
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'AI Score', dataIndex: 'score', key: 'score' },
    { title: 'Action', key: 'action', render: () => <Button type="link">View</Button> },
  ];

  return (
    <Card
      title={`Applications for ${jobTitle}`}
      extra={<Button onClick={onBack}>Back to Jobs</Button>}
    >
      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <div style={{ marginBottom: 16 }}>
        <Switch
          checked={isAutomatedTestingEnabled}
          onChange={handleSwitchChange}
          loading={switchLoading}
          checkedChildren="Yes"
          unCheckedChildren="No"
          disabled={isAutomatedTestingEnabled}
        />
        <span style={{ marginLeft: 8 }}>Enable Automated Testing</span>
      </div>
      <Table
        columns={columns}
        dataSource={applications}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}