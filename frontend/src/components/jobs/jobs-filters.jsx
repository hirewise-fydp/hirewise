"use client"
import { Row, Col, Input, Select, DatePicker, Button, Space, Typography, Collapse, Divider, Tag } from "antd"
import { SearchOutlined, FilterOutlined, CloseOutlined } from "@ant-design/icons"
import { useState } from "react"

const { Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select
const { Panel } = Collapse

const JobsFilters = ({
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  jobTypeFilter,
  setJobTypeFilter,
  employmentTypeFilter,
  setEmploymentTypeFilter,
  locationFilter,
  setLocationFilter,
  activePeriodRange,
  setActivePeriodRange,
  isActiveFilter,
  setIsActiveFilter,
  jobExpiredFilter,
  setJobExpiredFilter,
  skillsFilter,
  setSkillsFilter,
  educationFilter,
  setEducationFilter,
  experienceFilter,
  setExperienceFilter,
  availableSkills,
  availableLocations,
  availableEducation,
  applyFilters,
  resetFilters,
}) => {
  const [expandedFilters, setExpandedFilters] = useState(false)

  return (
    <div className="filters-section" style={{ marginBottom: 16, padding: 16, background: "#f9f9f9", borderRadius: 4 }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col>
          <Text strong style={{ fontSize: 16 }}>
            <FilterOutlined /> Filter Jobs
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
              placeholder="Search by job title or keywords"
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
      </Row>

      {/* Advanced Filters - Expandable */}
      {expandedFilters && (
        <>
          <Divider style={{ margin: "16px 0" }} />

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Job Type</Text>
                <Select
                  mode="multiple"
                  placeholder="Filter by job type"
                  value={jobTypeFilter}
                  onChange={setJobTypeFilter}
                  style={{ width: "100%" }}
                  allowClear
                >
                  <Option value="onsite">Onsite</Option>
                  <Option value="remote">Remote</Option>
                  <Option value="hybrid">Hybrid</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Employment Type</Text>
                <Select
                  mode="multiple"
                  placeholder="Filter by employment type"
                  value={employmentTypeFilter}
                  onChange={setEmploymentTypeFilter}
                  style={{ width: "100%" }}
                  allowClear
                >
                  <Option value="fullTime">Full Time</Option>
                  <Option value="partTime">Part Time</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Location</Text>
                <Select
                  mode="multiple"
                  placeholder="Filter by location"
                  value={locationFilter}
                  onChange={setLocationFilter}
                  style={{ width: "100%" }}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {availableLocations?.map((location) => (
                    <Option key={location} value={location}>
                      {location}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Active Period</Text>
                <RangePicker
                  style={{ width: "100%" }}
                  value={activePeriodRange}
                  onChange={(dates) => setActivePeriodRange(dates)}
                  placeholder={["Start Date", "End Date"]}
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Job Status</Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <Select
                      placeholder="Active Status"
                      value={isActiveFilter}
                      onChange={setIsActiveFilter}
                      style={{ width: "100%" }}
                      allowClear
                    >
                      <Option value={true}>Active</Option>
                      <Option value={false}>Inactive</Option>
                    </Select>
                  </Col>
                  <Col span={12}>
                    <Select
                      placeholder="Expired Status"
                      value={jobExpiredFilter}
                      onChange={setJobExpiredFilter}
                      style={{ width: "100%" }}
                      allowClear
                    >
                      <Option value={true}>Expired</Option>
                      <Option value={false}>Not Expired</Option>
                    </Select>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Text strong>Skills</Text>
                <Select
                  mode="multiple"
                  placeholder="Filter by required skills"
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
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <div>
                <Text strong>Education Level</Text>
                <Select
                  mode="multiple"
                  placeholder="Filter by education level"
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
            <Col xs={24} md={12}>
              <div>
                <Text strong>Experience Level</Text>
                <Select
                  mode="multiple"
                  placeholder="Filter by experience level"
                  value={experienceFilter}
                  onChange={setExperienceFilter}
                  style={{ width: "100%" }}
                  allowClear
                >
                  <Option value="entry">Entry Level</Option>
                  <Option value="mid">Mid Level</Option>
                  <Option value="senior">Senior Level</Option>
                  <Option value="executive">Executive Level</Option>
                </Select>
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
                Status: {statusFilter.join(", ")}
              </Tag>
            )}
            {jobTypeFilter?.length > 0 && (
              <Tag closable onClose={() => setJobTypeFilter([])}>
                Job Type: {jobTypeFilter.join(", ")}
              </Tag>
            )}
            {employmentTypeFilter?.length > 0 && (
              <Tag closable onClose={() => setEmploymentTypeFilter([])}>
                Employment: {employmentTypeFilter.join(", ")}
              </Tag>
            )}
            {locationFilter?.length > 0 && (
              <Tag closable onClose={() => setLocationFilter([])}>
                Location: {locationFilter.length} selected
              </Tag>
            )}
            {skillsFilter?.length > 0 && (
              <Tag closable onClose={() => setSkillsFilter([])}>
                Skills: {skillsFilter.length} selected
              </Tag>
            )}
            {isActiveFilter !== undefined && (
              <Tag closable onClose={() => setIsActiveFilter(undefined)}>
                {isActiveFilter ? "Active Jobs" : "Inactive Jobs"}
              </Tag>
            )}
            {jobExpiredFilter !== undefined && (
              <Tag closable onClose={() => setJobExpiredFilter(undefined)}>
                {jobExpiredFilter ? "Expired Jobs" : "Non-expired Jobs"}
              </Tag>
            )}
            {dateRange && dateRange[0] && dateRange[1] && (
              <Tag closable onClose={() => setDateRange(null)}>
                Created: {dateRange[0].format("MMM D")} - {dateRange[1].format("MMM D")}
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

export default JobsFilters
