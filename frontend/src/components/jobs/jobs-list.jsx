"use client"

import { useState, useEffect } from "react"
import {
  Button,
  Card,
  Table,
  Space,
  Tag,
  Dropdown,
  Badge,
  Tooltip,
  Empty,
  Alert,
  Switch,
  Typography,
  Divider,
} from "antd"
import {
  PlusOutlined,
  EllipsisOutlined,
  ReloadOutlined,
  EyeOutlined,
  FilterOutlined,
  FileTextOutlined,
  TeamOutlined,
  FormOutlined,
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import useJobs from "../../hooks/useJobs"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import axiosInstance from "../../axios/AxiosInstance"
import JobsMetrics from "./jobs-metrics"
import JobsFilters from "./jobs-filters"

dayjs.extend(relativeTime)

const { Title, Text } = Typography

// Status colors mapping
const statusColors = {
  pending: "gold",
  completed: "green",
  failed: "red",
  retrying: "blue",
}

export default function JobsList({ onManageJob }) {
  const { jobs, setJobs, loading } = useJobs()
  const navigate = useNavigate()

  // State for dashboard
  const [searchText, setSearchText] = useState("")
  const [filteredJobs, setFilteredJobs] = useState([])
  const [statusFilter, setStatusFilter] = useState([])
  const [dateRange, setDateRange] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Dashboard metrics
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    totalCandidates: 0,
  })

  // Calculate metrics when jobs change
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      const activeJobs = jobs.filter((job) => job.isActive).length
      const pendingJobs = jobs.filter((job) => job.status === "pending").length
      const completedJobs = jobs.filter((job) => job.status === "completed").length
      const failedJobs = jobs.filter((job) => job.status === "failed").length

      // This would typically come from an API call, but for now we'll estimate
      const totalCandidates = jobs.reduce((total, job) => {
        return total + (job.candidateCount || 0)
      }, 0)

      setMetrics({
        totalJobs: jobs.length,
        activeJobs,
        pendingJobs,
        completedJobs,
        failedJobs,
        totalCandidates,
      })

      // Initialize filtered jobs
      setFilteredJobs(jobs)
    }
  }, [jobs])

  // Handle creating a new job
  const handleCreateJob = () => {
    navigate("/create-job")
  }

  // Handle refreshing job data
  const handleRefresh = async () => {
    setRefreshing(true)
    setError(null)

    try {
      const response = await axiosInstance.get(`/api/v4/hr/findAll`)
      setJobs(response.data || [])
    } catch (err) {
      setError("Failed to refresh jobs. Please try again.")
      console.error(err)
    } finally {
      setRefreshing(false)
    }
  }

  // Handle toggling job active status
  const handleToggleActive = async (jobId, currentStatus) => {
    try {
      await axiosInstance.put(`/api/v4/hr/updateJob/${jobId}`, {
        isActive: !currentStatus,
      })

      // Update local state
      const updatedJobs = jobs.map((job) => {
        if (job._id === jobId) {
          return { ...job, isActive: !currentStatus }
        }
        return job
      })

      setJobs(updatedJobs)
    } catch (err) {
      console.error("Error toggling job status:", err)
    }
  }

  // Apply filters
  const applyFilters = () => {
    let filtered = [...jobs]

    // Search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(searchLower) ||
          (job.location && job.location.toLowerCase().includes(searchLower)),
      )
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((job) => statusFilter.includes(job.status))
    }

    // Date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day")
      const endDate = dateRange[1].endOf("day")

      filtered = filtered.filter((job) => {
        const createdAt = dayjs(job.createdAt)
        return createdAt.isAfter(startDate) && createdAt.isBefore(endDate)
      })
    }

    setFilteredJobs(filtered)
  }

  // Reset filters
  const resetFilters = () => {
    setSearchText("")
    setStatusFilter([])
    setDateRange(null)
    setFilteredJobs(jobs)
  }

  // Define table columns
  const columns = [
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      sorter: (a, b) => a.jobTitle.localeCompare(b.jobTitle),
      render: (text, record) => (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text strong>{text}</Text>
            {record.isActive ? (
              <Badge status="success" style={{ marginLeft: 8 }} />
            ) : (
              <Badge status="default" style={{ marginLeft: 8 }} />
            )}
          </div>
          <Text type="secondary">{record.location || "No location specified"}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>
      ),
    },
    {
      title: "Modules",
      key: "modules",
      render: (_, record) => (
        <Space>
          {record.modules?.cvScreening && (
            <Tooltip title="CV Screening">
              <Tag color="blue">
                <FileTextOutlined /> CV
              </Tag>
            </Tooltip>
          )}
          {record.modules?.automatedTesting && (
            <Tooltip title="Automated Testing">
              <Tag color="purple">
                <FormOutlined /> Test
              </Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Candidates",
      dataIndex: "candidateCount",
      key: "candidateCount",
      sorter: (a, b) => (a.candidateCount || 0) - (b.candidateCount || 0),
      render: (count, record) => (
        <div>
          <Text>{count || 0}</Text>
          {count > 0 && (
            <Button
              type="link"
              size="small"
              onClick={() => onManageJob(record._id)}
              style={{ padding: 0, marginLeft: 4 }}
            >
              View
            </Button>
          )}
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => <Tooltip title={dayjs(date).format("YYYY-MM-DD HH:mm")}>{dayjs(date).fromNow()}</Tooltip>,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Switch checked={isActive} onChange={() => handleToggleActive(record._id, isActive)} size="small" />
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => {
        const items = [
          {
            key: "manage",
            label: "Manage Candidates",
            icon: <TeamOutlined />,
            onClick: () => onManageJob(record._id),
          },
          {
            key: "view",
            label: "View Details",
            icon: <EyeOutlined />,
            onClick: () => navigate(`/jobs/${record._id}`),
          },
        ]

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button type="text" icon={<EllipsisOutlined />} />
          </Dropdown>
        )
      },
    },
  ]

  return (
    <div className="jobs-dashboard">
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setError(null)}
        />
      )}

      {/* Dashboard Metrics */}
      <JobsMetrics metrics={metrics} />

      <Divider />

      {/* Jobs Table Card */}
      <Card
        title={<Title level={4}>Posted Jobs</Title>}
        extra={
          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              type={showFilters ? "primary" : "default"}
            >
              Filters
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={refreshing}>
              Refresh
            </Button>
            <Button type="primary" onClick={handleCreateJob} icon={<PlusOutlined />}>
              Create New Job
            </Button>
          </Space>
        }
      >
        {/* Filters Section */}
        {showFilters && (
          <JobsFilters
            searchText={searchText}
            setSearchText={setSearchText}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
          />
        )}

        {/* Jobs Table */}
        <Table
          columns={columns}
          dataSource={filteredJobs}
          rowKey="_id"
          loading={loading || refreshing}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} jobs`,
          }}
          locale={{
            emptyText: <Empty description="No jobs found" />,
          }}
        />
      </Card>
    </div>
  )
}
