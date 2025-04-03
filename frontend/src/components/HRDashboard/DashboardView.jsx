import React from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
  UserOutlined,
  FileSearchOutlined,
  PauseCircleOutlined,
  StarOutlined
} from '@ant-design/icons';

const statsData = [
  { title: "Total Applications", value: 1234, icon: <UserOutlined /> },
  { title: "Active Jobs", value: 23, icon: <FileSearchOutlined /> },
  { title: "Paused Jobs", value: 4, icon: <PauseCircleOutlined /> },
  { title: "Top Candidates", value: 45, icon: <StarOutlined /> }
];

const { Title } = Typography;

export default function DashboardView() {
  return (
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
}