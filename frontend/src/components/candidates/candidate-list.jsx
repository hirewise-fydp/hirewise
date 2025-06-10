"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Dropdown,
  Typography,
  Row,
  Col,
  Progress,
  Empty,
  message,
  Alert,
  Badge,
} from "antd";
import {
  FilterOutlined,
  FileTextOutlined,
  UserOutlined,
  MoreOutlined,
  ReloadOutlined,
  CopyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import useApplications from "../../hooks/useApplications";
import useJobs from "../../hooks/useJobs";
import axiosInstance from "../../axios/AxiosInstance";
import CandidateFilters from "./candidate-filters";
import CandidateDetails from "./candidate-details";
import CvPreview from "./cv-preview";

const { Title, Text } = Typography;

// Status options and other constants
const statusOptions = [
  { value: "cv_processing", label: "CV Processing" },
  { value: "cv_processed", label: "CV Processed" },
  { value: "cv_screened", label: "CV Screened" },
  { value: "test_invited", label: "Test Invited" },
  { value: "test_started", label: "Test Started" },
  { value: "test_completed", label: "Test Completed" },
  { value: "short_listed", label: "Short Listed" },
  { value: "rejected", label: "Rejected" },
  { value: "evaluation_failed", label: "Evaluation Failed" },
  { value: "cv_processing_failed", label: "CV Processing Failed" },
];

const statusColors = {
  cv_processing: "processing",
  cv_processed: "default",
  cv_screened: "default",
  test_invited: "warning",
  test_started: "processing",
  test_completed: "info",
  short_listed: "success",
  rejected: "error",
  evaluation_failed: "error",
  cv_processing_failed: "error",
};

const CandidateList = ({ jobId, onBack }) => {
  // State variables
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [cvScoreRange, setCvScoreRange] = useState([0, 100]);
  const [testScoreRange, setTestScoreRange] = useState([0, 100]);
  const [dateRange, setDateRange] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cvPreviewVisible, setCvPreviewVisible] = useState(false);
  const [cvPreviewUrl, setCvPreviewUrl] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [skillsFilter, setSkillsFilter] = useState([]);
  const [educationFilter, setEducationFilter] = useState([]);
  const [experienceFilter, setExperienceFilter] = useState([]);
  const [testStatusFilter, setTestStatusFilter] = useState(undefined);
  const [dataRetentionFilter, setDataRetentionFilter] = useState(undefined);
  const [overallScoreRange, setOverallScoreRange] = useState([0, 100]);
  const [experienceScoreRange, setExperienceScoreRange] = useState([0, 100]);
  const [educationScoreRange, setEducationScoreRange] = useState([0, 100]);

  // Available options for filters
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableEducation, setAvailableEducation] = useState([]);

  const [jobInfo, setJobInfo] = useState({
    id: jobId,
    title: "Loading...",
    hasTest: false,
    formLink: "",
    testEnabled: false,
  });
  console.log("Job Info:", jobInfo);

  const {
    applications: candidates,
    loading,
    error,
    refetch,
  } = useApplications(jobId);
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs();

  // Extract unique values for filter options
  useEffect(() => {
    if (candidates && candidates.length > 0) {
      // Extract unique skills
      const skills = [
        ...new Set(
          candidates
            .flatMap((candidate) => candidate.parsedResume?.skills || [])
            .filter(Boolean)
        ),
      ];
      setAvailableSkills(skills);

      // Extract unique education levels
      const education = [
        ...new Set(
          candidates
            .map(
              (candidate) =>
                candidate.parsedResume?.education?.degree ||
                candidate.parsedResume?.education?.level
            )
            .filter(Boolean)
        ),
      ];
      setAvailableEducation(education);
    }
  }, [candidates]);

  // Initialize filtered candidates
  useEffect(() => {
    setFilteredCandidates(candidates);
  }, [candidates]);

  // Fetch job data
  useEffect(() => {
    if (!jobId) return;

    const fetchJobData = async () => {
      try {
        const testResponse = await axiosInstance.get(
          `/api/v4/hr/hasTest/${jobId}`
        );
        const hasTest = testResponse.data.hasTest;
        const testEnabled = testResponse.data.testEnabled;
        const job = jobs.find((j) => j._id === jobId);
        setJobInfo({
          id: jobId,
          title: job?.jobTitle || "Job Position",
          hasTest: hasTest || false,
          testEnabled: testEnabled || false,
          formLink: `${window.location.origin}/form/${job?.formId || jobId}`,
        });
      } catch (err) {
        console.error("Error fetching job data or hasTest:", err);
        setJobInfo((prev) => ({
          ...prev,
          title: "Job Position",
          hasTest: false,
          formLink: `${window.location.origin}/form/${jobId}`,
        }));
      }
    };

    if (!jobsLoading && jobs.length >= 0) {
      fetchJobData();
    }
  }, [jobId, jobs, jobsLoading]);

  // Handle refreshing candidate data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      message.success("Candidate data refreshed");
    } catch (err) {
      message.error("Failed to refresh candidate data");
    } finally {
      setRefreshing(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...candidates];

    // Search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          (candidate.candidateName &&
            candidate.candidateName.toLowerCase().includes(searchLower)) ||
          (candidate.candidateEmail &&
            candidate.candidateEmail.toLowerCase().includes(searchLower)) ||
          (candidate.candidatePhone &&
            candidate.candidatePhone.includes(searchText))
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((candidate) =>
        statusFilter.includes(candidate.status)
      );
    }

    // CV Score filter
    filtered = filtered.filter((candidate) => {
      const score = Number.parseInt(candidate.cvScore) || 0;
      return score >= cvScoreRange[0] && score <= cvScoreRange[1];
    });

    // Test Score filter
    filtered = filtered.filter((candidate) => {
      if (!candidate.testScore) return testScoreRange[0] === 0;
      const score = Number.parseInt(candidate.testScore) || 0;
      return score >= testScoreRange[0] && score <= testScoreRange[1];
    });

    // Skills filter
    if (skillsFilter.length > 0) {
      filtered = filtered.filter((candidate) =>
        candidate.parsedResume?.skills?.some((skill) =>
          skillsFilter.some((filterSkill) =>
            skill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }

    // Education filter
    if (educationFilter.length > 0) {
      filtered = filtered.filter((candidate) => {
        const candidateEducation =
          candidate.parsedResume?.education?.degree ||
          candidate.parsedResume?.education?.level ||
          "";
        return educationFilter.some((edu) =>
          candidateEducation.toLowerCase().includes(edu.toLowerCase())
        );
      });
    }

    // Experience filter
    if (experienceFilter.length > 0) {
      filtered = filtered.filter((candidate) => {
        const years = candidate.parsedResume?.experience?.years || 0;

        if (experienceFilter.includes("entry") && years >= 0 && years <= 2)
          return true;
        if (experienceFilter.includes("mid") && years > 2 && years <= 5)
          return true;
        if (experienceFilter.includes("senior") && years > 5 && years <= 10)
          return true;
        if (experienceFilter.includes("expert") && years > 10) return true;

        return false;
      });
    }

    // Test status filter
    if (testStatusFilter) {
      filtered = filtered.filter((candidate) => {
        switch (testStatusFilter) {
          case "not_started":
            return !candidate.testStartedAt && !candidate.testSubmittedAt;
          case "in_progress":
            return candidate.testStartedAt && !candidate.testSubmittedAt;
          case "completed":
            return candidate.testSubmittedAt;
          case "expired":
            return (
              candidate.testTokenExpires &&
              new Date(candidate.testTokenExpires) < new Date()
            );
          default:
            return true;
        }
      });
    }

    // Data retention filter
    if (dataRetentionFilter) {
      const now = new Date();
      filtered = filtered.filter((candidate) => {
        if (!candidate.dataRetention?.expiresAt) return false;

        const expiryDate = new Date(candidate.dataRetention.expiresAt);
        const daysUntilExpiry = Math.floor(
          (expiryDate - now) / (1000 * 60 * 60 * 24)
        );

        switch (dataRetentionFilter) {
          case "expiring_soon":
            return daysUntilExpiry <= 30;
          case "expiring_medium":
            return daysUntilExpiry <= 90;
          case "expiring_long":
            return daysUntilExpiry <= 180;
          case "not_expiring":
            return daysUntilExpiry > 180;
          default:
            return true;
        }
      });
    }

    // Overall score filter
    filtered = filtered.filter((candidate) => {
      const score =
        Number.parseInt(candidate.evaluationResults?.overallScore) || 0;
      return score >= overallScoreRange[0] && score <= overallScoreRange[1];
    });

    // Experience score filter
    filtered = filtered.filter((candidate) => {
      const score =
        Number.parseInt(candidate.evaluationResults?.experienceScore) || 0;
      return (
        score >= experienceScoreRange[0] && score <= experienceScoreRange[1]
      );
    });

    // Education score filter
    filtered = filtered.filter((candidate) => {
      const score =
        Number.parseInt(candidate.evaluationResults?.educationScore) || 0;
      return score >= educationScoreRange[0] && score <= educationScoreRange[1];
    });

    // Application date filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");
      filtered = filtered.filter((candidate) => {
        if (!candidate.applicationDate) return false;
        const applicationDate = dayjs(candidate.applicationDate);
        return (
          applicationDate.isAfter(startDate) &&
          applicationDate.isBefore(endDate)
        );
      });
    }

    setFilteredCandidates(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchText("");
    setStatusFilter([]);
    setCvScoreRange([0, 100]);
    setTestScoreRange([0, 100]);
    setDateRange(null);
    setSkillsFilter([]);
    setEducationFilter([]);
    setExperienceFilter([]);
    setTestStatusFilter(undefined);
    setDataRetentionFilter(undefined);
    setOverallScoreRange([0, 100]);
    setExperienceScoreRange([0, 100]);
    setEducationScoreRange([0, 100]);
    setFilteredCandidates(candidates);
  };

  // Fetch candidate details
  const fetchCandidateDetails = async (candidateId) => {
    setLoadingDetails(true);
    try {
      const response = await axiosInstance.get(
        `/api/v4/candidate/${candidateId}`
      );
      setCandidateDetails(response.data);
    } catch (err) {
      message.error("Failed to load candidate details");
      console.error("Error fetching candidate details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle menu actions
  const handleMenuClick = async (e, candidate) => {
    switch (e.key) {
      case "viewDetails":
        setSelectedCandidate(candidate);
        setDetailsVisible(true);
        await fetchCandidateDetails(candidate._id);
        break;
      case "viewCV":
        if (candidate.cvFile) {
          setCvPreviewUrl(candidate.cvFile.url);
          setCvPreviewVisible(true);
        } else {
          message.warning("CV file not available");
        }
        break;
      case "sendEmail":
        message.info(`Send email to ${candidate.candidateName}`);
        break;
      case "sendTestInvite":
        message.info(`Send test invitation to ${candidate.candidateName}`);
        break;

      case "markRejected":
        message.info(`Mark ${candidate.candidateName} as rejected`);
        break;
      default:
        break;
    }
  };

  const handleCopyFormLink = () => {
    if (jobInfo.testEnabled && !jobInfo.hasTest) {
      message.warning(
        "No test has been created for this job position. Cannot copy form link."
      );
      return;
    }

    navigator.clipboard
      .writeText(jobInfo.formLink)
      .then(() => {
        message.success("Form link copied to clipboard!");
      })
      .catch(() => {
        message.error("Failed to copy form link.");
      });
  };

  // Get test status badge
  const getTestStatusBadge = (candidate) => {
    if (!candidate.testToken) {
      return null;
    }

    if (candidate.testSubmittedAt) {
      return <Badge status="success" text="Completed" />;
    }

    if (candidate.testStartedAt) {
      return <Badge status="processing" text="In Progress" />;
    }

    if (
      candidate.testTokenExpires &&
      new Date(candidate.testTokenExpires) < new Date()
    ) {
      return <Badge status="error" text="Expired" />;
    }

    return <Badge status="warning" text="Not Started" />;
  };

  // Table columns
  const columns = [
    {
      title: "Candidate",
      dataIndex: "candidateName",
      key: "candidateName",
      sorter: (a, b) => a.candidateName.localeCompare(b.candidateName),
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
        if (!a.applicationDate || !b.applicationDate) return 0;
        return (
          dayjs(a.applicationDate).unix() - dayjs(b.applicationDate).unix()
        );
      },
      render: (date) => (date ? dayjs(date).format("MMM D, YYYY") : "N/A"),
    },
    {
      title: "CV Score",
      dataIndex: "cvScore",
      key: "cvScore",
      sorter: (a, b) => {
        const scoreA = Number.parseInt(a.cvScore) || 0;
        const scoreB = Number.parseInt(b.cvScore) || 0;
        return scoreA - scoreB;
      },
      render: (score) => {
        const numScore = Number.parseInt(score) || 0;
        return (
          <Progress
            percent={numScore}
            size="small"
            status={
              numScore >= 70
                ? "success"
                : numScore >= 40
                ? "normal"
                : "exception"
            }
            format={(percent) => `${percent}%`}
          />
        );
      },
    },
    {
      title: "Test",
      dataIndex: "testScore",
      key: "testScore",
      render: (score, record) => (
        <div>
          {score ? (
            <Progress
              percent={Number.parseInt(score)}
              size="small"
              status={
                Number.parseInt(score) >= 70
                  ? "success"
                  : Number.parseInt(score) >= 40
                  ? "normal"
                  : "exception"
              }
              format={(percent) => `${percent}%`}
            />
          ) : (
            <Text type="secondary">Not taken</Text>
          )}
          <div>{getTestStatusBadge(record)}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => {
        const statusObj = statusOptions.find((s) => s.value === status);
        return (
          <Tag color={statusColors[status] || "default"}>
            {statusObj?.label || status}
          </Tag>
        );
      },
    },
    {
      title: "Skills Match",
      key: "skillsMatch",
      render: (_, record) => {
        if (!record.skillsMatch?.length) {
          return <Text type="secondary">No data</Text>;
        }

        // Calculate average skill match
        const totalMatches = record.skillsMatch.reduce(
          (sum, skill) => sum + skill.matchStrength,
          0
        );

        const avgMatch = Math.round(totalMatches / record.skillsMatch.length);

        return (
          <Progress
            percent={avgMatch}
            size="small"
            status={
              avgMatch >= 70
                ? "success"
                : avgMatch >= 40
                ? "normal"
                : "exception"
            }
          />
        );
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
            disabled: !record.cvFile,
          },

          {
            type: "divider",
          },
          {
            key: "sendTestInvite",
            label: "Send Test Invite",
            icon: <ClockCircleOutlined />,
            disabled: record.testSubmittedAt || !jobInfo.hasTest,
          },
          {
            key: "markRejected",
            label: "Mark as Rejected",
            icon: <ExclamationCircleOutlined />,
            disabled: record.status === "rejected",
          },
        ];

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
        );
      },
    },
  ];

  return (
    <div className="candidate-listing-screen">
      {jobInfo.testEnabled && !jobInfo.hasTest && (
        <Alert
          message={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <WarningOutlined style={{ marginRight: 8 }} />
                <span>
                  No test has been created for this job position. Candidates
                  cannot be fully evaluated without a test.
                </span>
              </div>
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
              {jobsLoading
                ? "Loading job title..."
                : `Candidates for ${jobInfo.title}`}
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
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={refreshing}
              >
                Refresh
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
            skillsFilter={skillsFilter}
            setSkillsFilter={setSkillsFilter}
            educationFilter={educationFilter}
            setEducationFilter={setEducationFilter}
            experienceFilter={experienceFilter}
            setExperienceFilter={setExperienceFilter}
            testStatusFilter={testStatusFilter}
            setTestStatusFilter={setTestStatusFilter}
            dataRetentionFilter={dataRetentionFilter}
            setDataRetentionFilter={setDataRetentionFilter}
            overallScoreRange={overallScoreRange}
            setOverallScoreRange={setOverallScoreRange}
            experienceScoreRange={experienceScoreRange}
            setExperienceScoreRange={setExperienceScoreRange}
            educationScoreRange={educationScoreRange}
            setEducationScoreRange={setEducationScoreRange}
            availableSkills={availableSkills}
            availableEducation={availableEducation}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
            statusOptions={statusOptions}
          />
        )}

        <Table
          columns={columns}
          dataSource={filteredCandidates}
          rowKey="_id"
          loading={loading || jobsLoading || refreshing}
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
      <CvPreview
        visible={cvPreviewVisible}
        url={cvPreviewUrl}
        onClose={() => setCvPreviewVisible(false)}
      />

      {/* Candidate Details Drawer */}
      <CandidateDetails
        visible={detailsVisible}
        candidate={selectedCandidate}
        details={candidateDetails}
        loading={loadingDetails}
        onClose={() => {
          setDetailsVisible(false);
          setCandidateDetails(null);
        }}
        onViewCV={(url) => {
          setCvPreviewUrl(url.url);
          setCvPreviewVisible(true);
        }}
      />
    </div>
  );
};

export default CandidateList;
