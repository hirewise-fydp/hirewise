"use client"

import { useState, useEffect } from "react"
import { Table, Card, Button, Space, Tag, Dropdown, Typography, Row, Col, Progress, Empty, message, Alert } from "antd"
import {
  FilterOutlined,
  FileTextOutlined,
  UserOutlined,
  MoreOutlined,
  ReloadOutlined,
  CopyOutlined,
  WarningOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs"
import useApplications from "../../hooks/useApplications"
import useJobs from "../../hooks/useJobs"
import axiosInstance from "../../axios/AxiosInstance"
import CandidateFilters from "./candidate-filters"
import CandidateDetails from "./candidate-details"
import CvPreview from "./cv-preview"

const { Title, Text } = Typography

// Status options and other constants
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

const CandidateList = ({ jobId, onBack }) => {
  // State variables
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
  const [cvPreviewVisible, setCvPreviewVisible] = useState(false)
  const [cvPreviewUrl, setCvPreviewUrl] = useState("")
  const [jobInfo, setJobInfo] = useState({
    id: jobId,
    title: "Loading...",
    hasTest: false,
    formLink: "",
  })

  const { applications: candidates, loading, error } = useApplications(jobId)
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs()

  // Initialize filtered candidates
  useEffect(() => {
    setFilteredCandidates(candidates)
  }, [candidates])

  // Fetch job data
  useEffect(() => {
    if (!jobId) return

    const fetchJobData = async () => {
      try {
        const testResponse = await axiosInstance.get(`/api/v4/hr/hasTest/${jobId}`)
        const hasTest = testResponse.data.hasTest
        const job = jobs.find((j) => j._id === jobId)
        console.log("job data:", job)
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

  // Apply filters
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

  // Reset filters
  const resetFilters = () => {
    setSearchText("")
    setStatusFilter([])
    setCvScoreRange([0, 100])
    setTestScoreRange([0, 100])
    setDateRange(null)
    setFilteredCandidates(candidates)
  }

  // Fetch candidate details
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

  // Handle menu actions
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
    console.log("copy link console i here")
    navigator.clipboard
      .writeText(jobInfo.formLink)
      .then(() => {
        message.success("Application form link copied to clipboard!")
      })
      .catch(() => {
        message.error("Failed to copy link. Please try again.")
      })
  }

  // Table columns
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
              {/* <Button icon={<CopyOutlined />} onClick={handleCopyFormLink}>
                Copy Form Link
              </Button> */}  
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
            <Title level={4}>{jobsLoading ? "Loading job title..." : `Candidates for ${jobInfo.title}`}</Title>
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
              {onBack && <Button onClick={onBack}>Back to Jobs</Button>}
            </Space>
          </Col>
        </Row>

        {showFilters && (
          <CandidateFilters
            searchText={searchText}
            setSearchText={setSearchText}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            cvScoreRange={cvScoreRange}
            setCvScoreRange={setCvScoreRange}
            testScoreRange={testScoreRange}
            setTestScoreRange={setTestScoreRange}
            dateRange={dateRange}
            setDateRange={setDateRange}
            applyFilters={applyFilters}
            statusOptions={statusOptions}
          />
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
      <CvPreview visible={cvPreviewVisible} url={cvPreviewUrl} onClose={() => setCvPreviewVisible(false)} />

      {/* Candidate Details Drawer */}
      <CandidateDetails
        visible={detailsVisible}
        candidate={selectedCandidate}
        details={candidateDetails}
        loading={loadingDetails}
        onClose={() => {
          setDetailsVisible(false)
          setCandidateDetails(null)
        }}
        onViewCV={(url) => {
          console.log("url in candidate list:", url);
          
          setCvPreviewUrl(url.url)
          setCvPreviewVisible(true)
        }}
      />
    </div>
  )
}

export default CandidateList
