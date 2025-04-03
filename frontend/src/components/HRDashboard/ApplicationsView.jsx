import React from 'react';
import { Button, Card, Table, Typography } from 'antd';
import useApplications from '../../hooks/useApplications';
import useJobs from '../../hooks/useJobs';

const { Title } = Typography;

export default function ApplicationsView({ jobId, onBack }) {
  const { applications, loading } = useApplications(jobId);
  const { jobs } = useJobs();

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'AI Score', dataIndex: 'score', key: 'score' },
    { title: 'Action', key: 'action', render: () => <Button type="link">View</Button> }
  ];

  const jobTitle = jobs.find(j => j.id === jobId)?.title;

  return (
    <Card 
      title={jobId ? `Applications for ${jobTitle}` : 'All Applications'}
      extra={jobId && <Button onClick={onBack}>Back to Jobs</Button>}
    >
      {!jobId && jobs.map(job => (
        <div key={job.id} style={{ marginBottom: 24 }}>
          <Title level={5}>{job.title}</Title>
          <Table 
            columns={columns} 
            dataSource={applications.filter(app => app.jobId === job.id)} 
            pagination={false}
            rowKey="id"
            loading={loading}
          />
        </div>
      ))}

      {jobId && <Table columns={columns} dataSource={applications} rowKey="id" loading={loading} />}
    </Card>
  );
}