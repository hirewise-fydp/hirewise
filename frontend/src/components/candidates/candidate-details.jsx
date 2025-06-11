"use client";
import {
  Drawer,
  Typography,
  Row,
  Col,
  Divider,
  Progress,
  Empty,
  Button,
  Space,
  Card,
  Statistic,
  Spin,
} from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  MailOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const CandidateDetails = ({
  visible,
  candidate,
  details,
  loading,
  onClose,
  onViewCV,
}) => {
  const handleDownloadCV = (url) => {
    console.log("Downloading CV from URL:", url);

    if (!url) return;

    const link = document.createElement("a");
    link.href = url;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <Drawer
      title={candidate?.name}
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading candidate details...</div>
        </div>
      ) : details ? (
        <div className="candidate-details">
          <section>
            <Title level={5}>Contact Information</Title>
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <Text type="secondary">Email:</Text>
              </Col>
              <Col span={16}>
                <Text>{details.candidateEmail}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Phone:</Text>
              </Col>
              <Col span={16}>
                <Text>{details.candidatePhone}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Applied on:</Text>
              </Col>
              <Col span={16}>
                <Text>
                  {details.applicationDate
                    ? dayjs(details.applicationDate).format("MMMM D, YYYY")
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
                    percent={Number.parseInt(details.cvScore) || 0}
                    status={
                      Number.parseInt(details.cvScore) >= 70
                        ? "success"
                        : Number.parseInt(details.cvScore) >= 40
                        ? "normal"
                        : "exception"
                    }
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Test Score">
                  {details.testScore ? (
                    <Progress
                      type="circle"
                      percent={Number.parseInt(details.testScore)}
                      status={
                        Number.parseInt(details.testScore) >= 70
                          ? "success"
                          : Number.parseInt(details.testScore) >= 40
                          ? "normal"
                          : "exception"
                      }
                    />
                  ) : (
                    <Empty
                      description="Test not taken"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            {details.evaluationResults?.skillMatches && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Skill Matches</Text>
                <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
                  {details.evaluationResults.skillMatches.map(
                    (skill, index) => (
                      <Col span={8} key={index}>
                        <Card size="small" title={skill.skill}>
                          <Progress
                            percent={skill.matchStrength}
                            size="small"
                          />
                        </Card>
                      </Col>
                    )
                  )}
                </Row>
              </div>
            )}

            {details.evaluationResults && (
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <Statistic
                    title="Experience Score"
                    value={details.evaluationResults.experienceScore || 0}
                    suffix="/ 100"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Education Score"
                    value={details.evaluationResults.educationScore || 0}
                    suffix="/ 100"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Overall Score"
                    value={details.evaluationResults.overallScore || 0}
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
                  if (details.cvFile) {
                    onViewCV(details.cvFile);
                  }
                }}
              >
                View CV
              </Button>
              {/* <Button
                onClick={(url) => handleDownloadCV(details.cvFile.url)}
                icon={<DownloadOutlined />}
              >
                Download CV
              </Button>
              <Button icon={<MailOutlined />}>Send Email</Button> */}
            </Space>
          </section>
        </div>
      ) : (
        <Empty description="No candidate details available" />
      )}
    </Drawer>
  );
};

export default CandidateDetails;
