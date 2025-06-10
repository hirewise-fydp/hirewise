"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  Button,
  Typography,
  Descriptions,
  Tag,
  Space,
  Alert,
  Spin,
  Tabs,
  message, // Import message from antd
} from "antd"
import { FormOutlined, UserOutlined, FileTextOutlined, CopyOutlined, WarningOutlined } from "@ant-design/icons"
import axiosInstance from "../../../axios/AxiosInstance"

const { Title, Text } = Typography
const { TabPane } = Tabs

const JobDetails = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [jobDetails, setJobDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get(`/api/v4/hr/findJd/${jobId}`)
        console.log("respons is here", response.data)
        setJobDetails(response.data)
      } catch (err) {
        setError("Failed to load job details")
        console.error("Error fetching job details:", err)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJobDetails()
    }
  }, [jobId])

  const handleCreateTest = () => {
    navigate(`/jobs/${jobId}/create-test`)
  }

  const handleCopyFormLink = () => {
    console.log('form details:' , jobDetails)
    const formLink = `${window.location.origin}/form/${jobDetails.formId}`
    navigator.clipboard
      .writeText(formLink)
      .then(() => {
        message.success("Application form link copied to clipboard!")
      })
      .catch(() => {
        message.error("Failed to copy link")
      })
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />
  }

  return (
    <div className="job-details">
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <Title level={3}>{jobDetails?.jobTitle}</Title>
            <Space>
              <Tag color="blue">{jobDetails?.location
}</Tag>
              <Tag color={jobDetails?.isActive ? "green" : "default"}>
                {jobDetails?.isActive ? "Active" : "Inactive"}
              </Tag>
              <Tag color={jobDetails?.testCreated ? "success" : "warning"}>
                {jobDetails?.testCreated ? "Test Created" : "No Test"}
              </Tag>
            </Space>
          </div>
          <Space>
            <Button icon={<CopyOutlined />} onClick={handleCopyFormLink}>
              Copy Form Link 
            </Button>
            {!jobDetails?.testCreated ? (
              <Button type="primary" icon={<FormOutlined />} onClick={handleCreateTest} size="large">
                Create Test
              </Button>
            ) : (
              <Button
                icon={<FileTextOutlined />}
                onClick={() => message.info("View test functionality to be implemented")}
              >
                View Test
              </Button>
            )}
          </Space>
        </div>

        {!jobDetails?.testCreated && (
          <Alert
            message={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <WarningOutlined style={{ marginRight: 8 }} />
                  <span>
                    No test has been created for this job position. Creating a test will allow you to evaluate
                    candidates' skills and knowledge.
                  </span>
                </div>
                <Button type="primary" size="small" onClick={handleCreateTest}>
                  Create Test Now
                </Button>
              </div>
            }
            type="warning"
            showIcon={false}
            style={{ marginBottom: 16 }}
          />
        )}

        <Tabs defaultActiveKey="candidates">
          <TabPane
            tab={
              <span>
                <FileTextOutlined /> Job Details
              </span>
            }
            key="details"
          >
            <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Job Title" span={3}>
                {jobDetails?.jobTitle}
              </Descriptions.Item>
              <Descriptions.Item label="Location" span={1}>
                {jobDetails?.location?.charAt(0).toUpperCase() + jobDetails?.location?.slice(1) || "Not specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Type" span={1}>
                {jobDetails?.jobType || "Not specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Experience" span={2}>
                {jobDetails?.qualifications?.experience || "Not specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Education" span={3}>
                {jobDetails?.qualifications?.education || "Not specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Job Summary" span={3}>
                {jobDetails?.jobSummary || "No summary provided"}
              </Descriptions.Item>
              <Descriptions.Item label="Skills" span={3}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {jobDetails?.qualifications?.skills?.map((skill, index) => (
                    <Tag key={index} color="blue">
                      {skill}
                    </Tag>
                  ))}
                  {(!jobDetails?.qualifications?.skills || jobDetails.qualifications.skills.length === 0) && (
                    <Text type="secondary">No skills specified</Text>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Key Responsibilities" span={3}>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {jobDetails?.keyResponsibilities?.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                  {(!jobDetails?.keyResponsibilities || jobDetails.keyResponsibilities.length === 0) && (
                    <Text type="secondary">No responsibilities specified</Text>
                  )}
                </ul>
              </Descriptions.Item>
            </Descriptions>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default JobDetails
