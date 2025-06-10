"use client"
import { useState } from "react"
import { Row, Col, Input, Select, Slider, DatePicker, Button, Typography, Space, Divider, Tag, Collapse } from "antd"
import { SearchOutlined, FilterOutlined, CloseOutlined } from "@ant-design/icons"

const { Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select
const { Panel } = Collapse

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
  skillsFilter,
  setSkillsFilter,
  educationFilter,
  setEducationFilter,
  experienceFilter,
  setExperienceFilter,
  testStatusFilter,
  setTestStatusFilter,
  dataRetentionFilter,
  setDataRetentionFilter,
  overallScoreRange,
  setOverallScoreRange,
  experienceScoreRange,
  setExperienceScoreRange,
  educationScoreRange,
  setEducationScoreRange,
  availableSkills,
  availableEducation,
  applyFilters,
  resetFilters,
  statusOptions,
}) => {
  const [expandedFilters, setExpandedFilters] = useState(false)

  return (
    <div className="filters-section" style={{ marginBottom: 16, padding: 16, background: "#f9f9f9", borderRadius: 4 }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col>
          <Text strong style={{ fontSize: 16 }}>
            <FilterOutlined /> Filter Candidates
          </Text>
        </Col>
        <Col>
          <Button
            icon={expandedFilters ? <CloseOutlined /> : <FilterOutlined />}
            onClick={() => setExpandedFilters(!expandedFilters)}
            type="text"
          >
            {expandedFilters ? "Collapse Filters" : "Expand Filters"}
          </Button>
        </Col>
      </Row>

      <Divider style={{ margin: "12px 0" }} />

      {/* Basic Filters - Always Visible */}
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} md={8}>
          <div>
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
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div>
            <Text strong>Application Date</Text>
            <RangePicker style={{ width: "100%" }} value={dateRange} onChange={(dates) => setDateRange(dates)} />
          </div>
        </Col>
      </Row>

      {/* Advanced Filters - Expandable */}
      {expandedFilters && (
        <>
          <Divider style={{ margin: "16px 0" }} />

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div>
                <Text strong>
                  CV Score Range: {cvScoreRange[0]} - {cvScoreRange[1]}
                </Text>
                <Slider range min={0} max={100} value={cvScoreRange} onChange={(value) => setCvScoreRange(value)} />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div>
                <Text strong>
                  Test Score Range: {testScoreRange[0]} - {testScoreRange[1]}
                </Text>
                <Slider range min={0} max={100} value={testScoreRange} onChange={(value) => setTestScoreRange(value)} />
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Skills</Text>
                <Select
                  mode="multiple"
                  placeholder="Filter by skills"
                  value={skillsFilter}
                  onChange={setSkillsFilter}
                  style={{ width: "100%" }}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {availableSkills?.map((skill) => (
                    <Option key={skill} value={skill}>
                      {skill}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Education</Text>
                <Select
                  mode="multiple"
                  placeholder="Filter by education"
                  value={educationFilter}
                  onChange={setEducationFilter}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {availableEducation?.map((edu) => (
                    <Option key={edu} value={edu}>
                      {edu}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Experience</Text>
                <Select
                  mode="multiple"
                  placeholder="Filter by experience"
                  value={experienceFilter}
                  onChange={setExperienceFilter}
                  style={{ width: "100%" }}
                  allowClear
                >
                  <Option value="entry">Entry Level (0-2 years)</Option>
                  <Option value="mid">Mid Level (2-5 years)</Option>
                  <Option value="senior">Senior Level (5-10 years)</Option>
                  <Option value="expert">Expert (10+ years)</Option>
                </Select>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Test Status</Text>
                <Select
                  placeholder="Filter by test status"
                  value={testStatusFilter}
                  onChange={setTestStatusFilter}
                  style={{ width: "100%" }}
                  allowClear
                >
                  <Option value="not_started">Not Started</Option>
                  <Option value="in_progress">In Progress</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="expired">Expired</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Data Retention</Text>
                <Select
                  placeholder="Filter by data retention"
                  value={dataRetentionFilter}
                  onChange={setDataRetentionFilter}
                  style={{ width: "100%" }}
                  allowClear
                >
                  <Option value="expiring_soon">Expiring Soon (30 days)</Option>
                  <Option value="expiring_medium">Expiring in 90 days</Option>
                  <Option value="expiring_long">Expiring in 180 days</Option>
                  <Option value="not_expiring">Not Expiring Soon</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Text strong>
                  Overall Score Range: {overallScoreRange[0]} - {overallScoreRange[1]}
                </Text>
                <Slider
                  range
                  min={0}
                  max={100}
                  value={overallScoreRange}
                  onChange={(value) => setOverallScoreRange(value)}
                />
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <div>
                <Text strong>
                  Experience Score: {experienceScoreRange[0]} - {experienceScoreRange[1]}
                </Text>
                <Slider
                  range
                  min={0}
                  max={100}
                  value={experienceScoreRange}
                  onChange={(value) => setExperienceScoreRange(value)}
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div>
                <Text strong>
                  Education Score: {educationScoreRange[0]} - {educationScoreRange[1]}
                </Text>
                <Slider
                  range
                  min={0}
                  max={100}
                  value={educationScoreRange}
                  onChange={(value) => setEducationScoreRange(value)}
                />
              </div>
            </Col>
          </Row>
        </>
      )}

      <Divider style={{ margin: "16px 0" }} />

      {/* Active Filters Display */}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Space wrap>
            {statusFilter?.length > 0 && (
              <Tag closable onClose={() => setStatusFilter([])}>
                Status: {statusFilter.length} selected
              </Tag>
            )}
            {(cvScoreRange[0] > 0 || cvScoreRange[1] < 100) && (
              <Tag closable onClose={() => setCvScoreRange([0, 100])}>
                CV Score: {cvScoreRange[0]}-{cvScoreRange[1]}
              </Tag>
            )}
            {(testScoreRange[0] > 0 || testScoreRange[1] < 100) && (
              <Tag closable onClose={() => setTestScoreRange([0, 100])}>
                Test Score: {testScoreRange[0]}-{testScoreRange[1]}
              </Tag>
            )}
            {skillsFilter?.length > 0 && (
              <Tag closable onClose={() => setSkillsFilter([])}>
                Skills: {skillsFilter.length} selected
              </Tag>
            )}
            {educationFilter?.length > 0 && (
              <Tag closable onClose={() => setEducationFilter([])}>
                Education: {educationFilter.length} selected
              </Tag>
            )}
            {experienceFilter?.length > 0 && (
              <Tag closable onClose={() => setExperienceFilter([])}>
                Experience: {experienceFilter.length} selected
              </Tag>
            )}
            {testStatusFilter && (
              <Tag closable onClose={() => setTestStatusFilter(undefined)}>
                Test Status: {testStatusFilter.replace("_", " ")}
              </Tag>
            )}
            {dataRetentionFilter && (
              <Tag closable onClose={() => setDataRetentionFilter(undefined)}>
                Data Retention: {dataRetentionFilter.replace("_", " ")}
              </Tag>
            )}
            {dateRange && dateRange[0] && dateRange[1] && (
              <Tag closable onClose={() => setDateRange(null)}>
                Applied: {dateRange[0].format("MMM D")} - {dateRange[1].format("MMM D")}
              </Tag>
            )}
          </Space>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row>
        <Col xs={24} style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={resetFilters}>Reset All</Button>
            <Button type="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default CandidateFilters
