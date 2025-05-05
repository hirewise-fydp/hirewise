import { Row, Col, Card, Statistic } from "antd"
import {
  BarChartOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons"

const JobsMetrics = ({ metrics }) => {
  return (
    <Row gutter={[16, 16]} className="dashboard-metrics">
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic title="Total Jobs" value={metrics.totalJobs} prefix={<BarChartOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic
            title="Active Jobs"
            value={metrics.activeJobs}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic
            title="Pending Jobs"
            value={metrics.pendingJobs}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic
            title="Completed Jobs"
            value={metrics.completedJobs}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic
            title="Failed Jobs"
            value={metrics.failedJobs}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: "#f5222d" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={4}>
        <Card>
          <Statistic title="Total Candidates" value={metrics.totalCandidates} prefix={<UserOutlined />} />
        </Card>
      </Col>
    </Row>
  )
}

export default JobsMetrics
