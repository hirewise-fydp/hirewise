"use client"
import { Row, Col, Input, Select, DatePicker, Button, Space, Typography } from "antd"
import { SearchOutlined } from "@ant-design/icons"

const { Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const JobsFilters = ({
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  applyFilters,
  resetFilters,
}) => {
  return (
    <div className="filters-section" style={{ marginBottom: 16, padding: 16, background: "#f9f9f9", borderRadius: 4 }}>
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} md={8}>
          <div>
            <Text strong>Search</Text>
            <Input
              placeholder="Search by job title or location"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div>
            <Text strong>Status</Text>
            <Select
              mode="multiple"
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
              <Option value="retrying">Retrying</Option>
            </Select>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div>
            <Text strong>Created Date</Text>
            <RangePicker style={{ width: "100%" }} value={dateRange} onChange={(dates) => setDateRange(dates)} />
          </div>
        </Col>
        <Col xs={24} style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={resetFilters}>Reset</Button>
            <Button type="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default JobsFilters
