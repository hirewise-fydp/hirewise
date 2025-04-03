import React from 'react';
import { Button, Card, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { jobColumns } from '../../services/dataService';
import useJobs from '../../hooks/useJobs';
import { useNavigate } from 'react-router-dom';

export default function JobsList({ onManageJob }) {
  const { jobs, loading } = useJobs();
  console.log('jobs', jobs);
  
  let navigate = useNavigate()

  const handleCreateJob = () => {
    navigate('/create-job')
  }

  const columns = jobColumns.map(col => {
    if (col.key === 'action') {
      return {
        ...col,
        render: (_, record) => (
          <Button type="link" onClick={() => onManageJob(record.id)}>
            Manage
          </Button>
        )
      };
    }
    return col;
  });

  return (
    <Card 
      title="Posted Jobs" 
      extra={<Button type="primary" onClick={handleCreateJob} icon={<PlusOutlined />}>Create New Job</Button>}
    >
      <Table 
        columns={columns} 
        dataSource={jobs} 
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
}