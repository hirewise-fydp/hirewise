"use client"
import { Card, Row, Col, Input, Select, Slider, DatePicker, Button, Typography } from "antd"
import { SearchOutlined } from "@ant-design/icons"

const { Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const CandidateFilters = ({
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
  cvScoreRange,
  setCvScoreRange,
  testScoreRange,
  setTestScoreRange,
  dateRange,
  setDateRange,
  applyFilters,
  statusOptions,
}) => {
  return (
    <Card style={{ marginTop: 16, marginBottom: 16 }} bordered={false} className="filter-card">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <div className="filter-item">
            <Text strong>Search</Text>
            <Input
              placeholder="Search by name, email or phone"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="filter-item">
            <Text strong>Status</Text>
            <Select
              mode="multiple"
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              allowClear
            >
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div className="filter-item">
            <Text strong>Application Date</Text>
            <RangePicker style={{ width: "100%" }} value={dateRange} onChange={(dates) => setDateRange(dates)} />
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className="filter-item">
            <Text strong>
              CV Score Range: {cvScoreRange[0]} - {cvScoreRange[1]}
            </Text>
            <Slider range min={0} max={100} value={cvScoreRange} onChange={(value) => setCvScoreRange(value)} />
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className="filter-item">
            <Text strong>
              Test Score Range: {testScoreRange[0]} - {testScoreRange[1]}
            </Text>
            <Slider range min={0} max={100} value={testScoreRange} onChange={(value) => setTestScoreRange(value)} />
          </div>
        </Col>
        <Col xs={24} style={{ textAlign: "right" }}>
          <Button type="primary" onClick={applyFilters}>
            Apply Filters
          </Button>
        </Col>
      </Row>
    </Card>
  )
}

export default CandidateFilters
