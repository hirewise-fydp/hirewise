"use client"

import { useState, useEffect } from "react"
import {
  Table,
  Card,
  Input,
  Button,
  Select,
  Slider,
  DatePicker,
  Space,
  Tag,
  Dropdown,
  Typography,
  Row,
  Col,
  Drawer,
  Divider,
  Progress,
  Empty,
  message,
  Statistic,
  Alert,
  Spin,
  Modal, // Add Modal to imports
} from "antd"
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  ReloadOutlined,
  MailOutlined,
  CopyOutlined,
  WarningOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs"
import useApplications from "../../hooks/useApplications"
import useJobs from "../../hooks/useJobs"
import axiosInstance from "../../axios/AxiosInstance"

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

// Status options and other constants remain unchanged
const statusOptions = [
  { value: "cv_processing", label: "CV Processing" },
  { value: "cv_screened", label: "CV Screened" },
  { value: "test_invited", label: "Test Invited" },
  { value: "test_completed", label: "Test Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
]

const statusColors = {
  cv_processing: "processing",
  cv_screened: "default",
  test_invited: "warning",
  test_completed: "info",
  rejected: "error",
  hired: "success",
}

const CandidateListingScreen = ({ jobId }) => {
  // Existing state variables
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState([])
  const [cvScoreRange, setCvScoreRange] = useState([0, 100])
  const [testScoreRange, setTestScoreRange] = useState([0, 100])
  const [dateRange, setDateRange] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filteredCandidates, setFilteredCandidates] = useState([])
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [candidateDetails, setCandidateDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [jobInfo, setJobInfo] = useState({
    id: jobId,
    title: "Loading...",
    hasTest: false,
    formLink: "",
  })

  // New state for CV preview modal
  const [cvPreviewVisible, setCvPreviewVisible] = useState(false)
  const [cvPreviewUrl, setCvPreviewUrl] = useState("")

  const { applications: candidates, loading, error } = useApplications(jobId)
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs()

  // Existing useEffect hooks remain unchanged
  useEffect(() => {
    setFilteredCandidates(candidates)
  }, [candidates])

  useEffect(() => {
    if (!jobId) return

    const fetchJobData = async () => {
      try {
        const testResponse = await axiosInstance.get(`/api/v4/hr/hasTest/${jobId}`)
        const hasTest = testResponse.data.hasTest
        const job = jobs.find((j) => j._id === jobId)
        setJobInfo({
          id: jobId,
          title: job?.jobTitle || "Job Position",
          hasTest: hasTest || false,
          formLink: `${window.location.origin}/form/${job?.formId || jobId}`,
        })
      } catch (err) {
        console.error("Error fetching job data or hasTest:", err)
        setJobInfo((prev) => ({
          ...prev,
          title: "Job Position",
          hasTest: false,
          formLink: `${window.location.origin}/form/${jobId}`,
        }))
      }
    }

    if (!jobsLoading && jobs.length >= 0) {
      fetchJobData()
    }
  }, [jobId, jobs, jobsLoading])

  useEffect(() => {
    console.log("Job Info:", jobInfo)
  }, [jobInfo])

  // Existing filter functions remain unchanged
  const applyFilters = () => {
    let filtered = [...candidates]
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (candidate) =>
          (candidate.name && candidate.name.toLowerCase().includes(searchLower)) ||
          (candidate.candidateEmail && candidate.candidateEmail.toLowerCase().includes(searchLower)) ||
          (candidate.candidatePhone && candidate.candidatePhone.includes(searchText)),
      )
    }
    if (statusFilter.length > 0) {
      filtered = filtered.filter((candidate) => statusFilter.includes(candidate.status))
    }
    filtered = filtered.filter((candidate) => {
      const score = Number.parseInt(candidate.score) || 0
      return score >= cvScoreRange[0] && score <= cvScoreRange[1]
    })
    if (dateRange && dateRange[0] && dateRange[1] && candidates.some((c) => c.applicationDate)) {
      const startDate = dateRange[0].startOf("day")
      const endDate = dateRange[1].endOf("day")
      filtered = filtered.filter((candidate) => {
        if (!candidate.applicationDate) return true
        const applicationDate = dayjs(candidate.applicationDate)
        return applicationDate.isAfter(startDate) && applicationDate.isBefore(endDate)
      })
    }
    setFilteredCandidates(filtered)
  }

  const resetFilters = () => {
    setSearchText("")
    setStatusFilter([])
    setCvScoreRange([0, 100])
    setTestScoreRange([0, 100])
    setDateRange(null)
    setFilteredCandidates(candidates)
  }

  const fetchCandidateDetails = async (candidateId) => {
    setLoadingDetails(true)
    try {
      const response = await axiosInstance.get(`/api/v4/candidate/${candidateId}`)
      setCandidateDetails(response.data)
    } catch (err) {
      message.error("Failed to load candidate details")
      console.error("Error fetching candidate details:", err)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Modified handleMenuClick to handle CV preview
  const handleMenuClick = async (e, candidate) => {
    switch (e.key) {
      case "viewDetails":
        setSelectedCandidate(candidate)
        setDetailsVisible(true)
        await fetchCandidateDetails(candidate._id)
        break
      case "viewCV":
        if (candidate.cvFile) {
          setCvPreviewUrl(candidate.cvFile.url)
          setCvPreviewVisible(true)
        } else {
          message.warning("CV file not available")
        }
        break
      case "changeStatus":
        message.info(`Change status for ${candidate.name}`)
        break
      case "sendEmail":
        message.info(`Send email to ${candidate.name}`)
        break
      default:
        break
    }
  }

  const handleCopyFormLink = () => {
    navigator.clipboard
      .writeText(jobInfo.formLink)
      .then(() => {
        message.success("Application form link copied to clipboard!")
      })
      .catch(() => {
        message.error("Failed to copy link. Please try again.")
      })
  }

  // Existing table columns remain unchanged
  const columns = [
    {
      title: "Candidate",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          {record.candidateEmail && (
            <div>
              <Text type="secondary">{record.candidateEmail}</Text>
            </div>
          )}
          {record.candidatePhone && (
            <div>
              <Text type="secondary">{record.candidatePhone}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Application Date",
      dataIndex: "applicationDate",
      key: "applicationDate",
      sorter: (a, b) => {
        if (!a.applicationDate || !b.applicationDate) return 0
        return dayjs(a.applicationDate).unix() - dayjs(b.applicationDate).unix()
      },
      render: (date) => (date ? dayjs(date).format("MMM D, YYYY") : "N/A"),
    },
    {
      title: "CV Score",
      dataIndex: "score",
      key: "score",
      sorter: (a, b) => {
        const scoreA = Number.parseInt(a.score) || 0
        const scoreB = Number.parseInt(b.score) || 0
        return scoreA - scoreB
      },
      render: (score) => {
        const numScore = Number.parseInt(score) || 0
        return (
          <Progress
            percent={numScore}
            size="small"
            status={numScore >= 70 ? "success" : numScore >= 40 ? "normal" : "exception"}
            format={(percent) => `${percent}%`}
          />
        )
      },
    },
    {
      title: "Test Score",
      dataIndex: "testScore",
      key: "testScore",
      sorter: (a, b) => (Number.parseInt(a.testScore) || 0) - (Number.parseInt(b.testScore) || 0),
      render: (score) =>
        score ? (
          <Progress
            percent={Number.parseInt(score)}
            size="small"
            status={Number.parseInt(score) >= 70 ? "success" : Number.parseInt(score) >= 40 ? "normal" : "exception"}
            format={(percent) => `${percent}%`}
          />
        ) : (
          <Text type="secondary">Not taken</Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => {
        const statusObj = statusOptions.find((s) => s.value === status)
        return <Tag color={statusColors[status] || "default"}>{statusObj?.label || status}</Tag>
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const items = [
          {
            key: "viewDetails",
            label: "View Details",
            icon: <UserOutlined />,
          },
          {
            key: "viewCV",
            label: "View CV",
            icon: <FileTextOutlined />,
          },
          // {
          //   key: "changeStatus",
          //   label: "Change Status",
          //   icon: <CheckCircleOutlined />,
          // },
          // {
          //   key: "sendEmail",
          //   label: "Send Email",
          //   icon: <MailOutlined />,
          // },
        ]

        return (
          <Dropdown
            menu={{
              items,
              onClick: (e) => handleMenuClick(e, record),
            }}
            trigger={["click"]}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        )
      },
    },
  ]

  return (
    <div className="candidate-listing-screen">
      {/* Existing Alert and Card components remain unchanged */}
      {!jobInfo.hasTest && (
        <Alert
          message={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <WarningOutlined style={{ marginRight: 8 }} />
                <span>
                  No test has been created for this job position. Candidates cannot be fully evaluated without a test.
                </span>
              </div>
              <Button icon={<CopyOutlined />} onClick={handleCopyFormLink}>
                Copy Form Link
              </Button>
            </div>
          }
          type="warning"
          showIcon={false}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Title level={4}>
              {jobsLoading ? "Loading job title..." : `Candidates for ${jobInfo.title}`}
            </Title>
            {error && <Text type="danger">{error}</Text>}
            {jobsError && <Text type="danger">{jobsError}</Text>}
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space>
              <Button icon={<CopyOutlined />} onClick={handleCopyFormLink}>
                Copy Form Link
              </Button>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                type={showFilters ? "primary" : "default"}
              >
                Filters
              </Button>
              <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                Reset
              </Button>
            </Space>
          </Col>
        </Row>

        {showFilters && (
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
                  <Slider
                    range
                    min={0}
                    max={100}
                    value={testScoreRange}
                    onChange={(value) => setTestScoreRange(value)}
                  />
                </div>
              </Col>
              <Col xs={24} style={{ textAlign: "right" }}>
                <Button type="primary" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        <Table
          columns={columns}
          dataSource={filteredCandidates}
          rowKey="_id"
          loading={loading || jobsLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} candidates`,
          }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: <Empty description="No candidates found" />,
          }}
        />
      </Card>

      {/* CV Preview Modal */}
      <Modal
        title="CV Preview"
        open={cvPreviewVisible}
        onCancel={() => setCvPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCvPreviewVisible(false)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => window.open(cvPreviewUrl, "_blank")}
          >
            Download CV
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {cvPreviewUrl ? (
          <iframe
            src={cvPreviewUrl}
            style={{ width: "100%", height: "600px", border: "none" }}
            title="CV Preview"
          />
        ) : (
          <Empty description="No CV available" />
        )}
      </Modal>

      {/* Candidate Details Drawer */}
      <Drawer
        title={selectedCandidate?.name}
        placement="right"
        width={600}
        onClose={() => {
          setDetailsVisible(false)
          setCandidateDetails(null)
        }}
        open={detailsVisible}
      >
        {loadingDetails ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading candidate details...</div>
          </div>
        ) : candidateDetails ? (
          <div className="candidate-details">
            <section>
              <Title level={5}>Contact Information</Title>
              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <Text type="secondary">Email:</Text>
                </Col>
                <Col span={16}>
                  <Text>{candidateDetails.candidateEmail}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Phone:</Text>
                </Col>
                <Col span={16}>
                  <Text>{candidateDetails.candidatePhone}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Applied on:</Text>
                </Col>
                <Col span={16}>
                  <Text>
                    {candidateDetails.applicationDate
                      ? dayjs(candidateDetails.applicationDate).format("MMMM D, YYYY")
                      : "N/A"}
                  </Text>
                </Col>
              </Row>
            </section>

            <Divider />

            <section>
              <Title level={5}>Evaluation Results</Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="CV Score">
                    <Progress
                      type="circle"
                      percent={Number.parseInt(candidateDetails.cvScore) || 0}
                      status={
                        Number.parseInt(candidateDetails.cvScore) >= 70
                          ? "success"
                          : Number.parseInt(candidateDetails.cvScore) >= 40
                            ? "normal"
                            : "exception"
                      }
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Test Score">
                    {candidateDetails.testScore ? (
                      <Progress
                        type="circle"
                        percent={Number.parseInt(candidateDetails.testScore)}
                        status={
                          Number.parseInt(candidateDetails.testScore) >= 70
                            ? "success"
                            : Number.parseInt(candidateDetails.testScore) >= 40
                              ? "normal"
                              : "exception"
                        }
                      />
                    ) : (
                      <Empty description="Test not taken" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </Card>
                </Col>
              </Row>

              {candidateDetails.evaluationResults?.skillMatches && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Skill Matches</Text>
                  <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
                    {candidateDetails.evaluationResults.skillMatches.map((skill, index) => (
                      <Col span={8} key={index}>
                        <Card size="small" title={skill.skill}>
                          <Progress percent={skill.matchStrength} size="small" />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {candidateDetails.evaluationResults && (
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col span={8}>
                    <Statistic
                      title="Experience Score"
                      value={candidateDetails.evaluationResults.experienceScore || 0}
                      suffix="/ 100"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Education Score"
                      value={candidateDetails.evaluationResults.educationScore || 0}
                      suffix="/ 100"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Overall Score"
                      value={candidateDetails.evaluationResults.overallScore || 0}
                      suffix="/ 100"
                    />
                  </Col>
                </Row>
              )}
            </section>

            <Divider />

            <section>
              <Space>
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  onClick={() => {
                    if (candidateDetails.cvFile) {
                      setCvPreviewUrl(candidateDetails.cvFile)
                      setCvPreviewVisible(true)
                    } else {
                      message.warning("CV file not available")
                    }
                  }}
                >
                  View CV
                </Button>
                <Button icon={<DownloadOutlined />}>Download CV</Button>
                <Button icon={<MailOutlined />}>Send Email</Button>
              </Space>
            </section>
          </div>
        ) : (
          <Empty description="No candidate details available" />
        )}
      </Drawer>
    </div>
  )
}

export default CandidateListingScreen