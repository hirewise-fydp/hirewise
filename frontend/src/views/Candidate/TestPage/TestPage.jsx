"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  Radio,
  Button,
  Typography,
  Progress,
  Modal,
  Alert,
  Spin,
  Row,
  Col,
  Space,
  Divider,
} from "antd";
import {
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "./styles.css";
import axiosInstance from "../../../axios/AxiosInstance";
import { AxiosError } from "axios";

const { Title, Text, Paragraph } = Typography;

const TestPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // Test state
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour default
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  // Anti-cheating state
  const [violations, setViolations] = useState([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [testInvalidated, setTestInvalidated] = useState(false);

  // Refs
  const timerRef = useRef(null);
  const testContainerRef = useRef(null);
  const lastActiveTime = useRef(Date.now());

  // Initialize test
  useEffect(() => {
    if (!token) {
      Modal.error({
        title: "Invalid Access",
        content: "No valid test token provided. Please check your test link.",
        onOk: () => {},
      });
      return;
    }

    fetchTestData();
  }, [token]);

  useEffect(() => {
    if (!testStarted || testCompleted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const violation = {
          type: "TAB_SWITCH",
          timestamp: new Date().toISOString(),
          description: "Candidate switched away from test tab",
        };

        setViolations((prev) => [...prev, violation]);
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            invalidateTest("Multiple tab switches detected");
          } else {
            showWarning(`Warning: Tab switching detected (${newCount}/3)`);
          }
          return newCount;
        });
      }
    };

    const handleKeyDown = (e) => {
      // Prevent common cheating shortcuts
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "r") ||
        e.key === "F5"
      ) {
        e.preventDefault();
        showWarning("Keyboard shortcuts are disabled during the test");
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      showWarning("Right-click is disabled during the test");
    };

    const handleBeforeUnload = (e) => {
      if (!testCompleted) {
        e.preventDefault();
        e.returnValue =
          "Are you sure you want to leave? Your test progress will be lost.";
      }
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [testStarted, testCompleted]);

  // Timer
  useEffect(() => {
    if (!testStarted || testCompleted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitTest(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, testCompleted]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const fetchTestData = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/v4/test/access?token=${token}`
      );
      console.log("Test data response:", response.data.data);
      setTestData(response.data.data);
      setTimeLeft(response.data.data.questions.length * 120);
      setLoading(false);
    } catch (error) {
      console.log("Error accessing test data:", error.response?.data);

      Modal.error({
        title: "Test Access Failed",
        content: error.response.data.message,
        onOk: () => {},
      });
    }
  };

  const startTest = () => {
    setTestStarted(true);
  };

  const showWarning = (message) => {
    Modal.warning({
      title: "Test Violation Warning",
      content: message,
      icon: <WarningOutlined style={{ color: "#faad14" }} />,
    });
  };

  const invalidateTest = async (reason) => {
    setTestInvalidated(true);
    Modal.error({
      title: "Test Invalidated",
      content: `Your test has been invalidated due to: ${reason}`,
      onOk: () => navigate("/test-invalidated"),
    });
    await axiosInstance.get(`/api/v4/test/invalidate_test?token=${token}`);
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const submitTest = async (autoSubmit = false) => {
    if (testInvalidated) return;

    setSubmitting(true);

    try {
      const formattedAnswers = testData.questions.map((question, index) => ({
        questionNumber: index + 1,
        selectedOption: answers[index] || "",
      }));

      const response = await axiosInstance.post(
        "api/v4/test/submit",
        {
          applicationId: testData.applicationId,
          answers: formattedAnswers,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      setTestCompleted(true);

      Modal.success({
        title: autoSubmit
          ? "Test Auto-Submitted"
          : "Test Submitted Successfully",
        content:
          "Your test has been submitted successfully. You will be notified of the results via email.",
        onOk: () => navigate("/test-completed"),
      });
    } catch (error) {
      Modal.error({
        title: "Submission Failed",
        content:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="test-loading">
        <Spin size="large" />
        <p>Loading your test...</p>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="test-instructions" ref={testContainerRef}>
        <Card className="instructions-card">
          <div className="instructions-header">
            <Title level={2}>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 8 }}
              />
              {testData?.jobTitle} - Assessment Test
            </Title>
          </div>

          <Divider />

          <div className="test-info">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" className="info-card">
                  <Text strong>Total Questions</Text>
                  <br />
                  <Text className="info-value">
                    {testData?.questions.length}
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="info-card">
                  <Text strong>Time Limit</Text>
                  <br />
                  <Text className="info-value">{formatTime(timeLeft)}</Text>
                </Card>
              </Col>
            </Row>
          </div>

          <Alert
            message="Important Instructions"
            description={
              <ul className="instructions-list">
                <li>This test must be completed in one session</li>
                <li>
                  Do not switch tabs, minimize window, or leave the test page
                </li>
                <li>Right-click and keyboard shortcuts are disabled</li>
                <li>The test will run in fullscreen mode</li>
                <li>
                  You have {Math.floor(timeLeft / 60)} minutes to complete all
                  questions
                </li>
                <li>Your progress is automatically saved</li>
                <li>Maximum 3 tab switches allowed before test invalidation</li>
              </ul>
            }
            type="warning"
            showIcon
            style={{ margin: "20px 0" }}
          />

          <div className="start-button-container">
            <Button
              type="primary"
              size="large"
              onClick={startTest}
              icon={<ClockCircleOutlined />}
            >
              Start Test
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="test-container" ref={testContainerRef}>
      {/* Test Header */}
      <div className="test-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {testData?.jobTitle} Assessment
            </Title>
          </Col>
          <Col>
            <Space size="large">
              <div className="timer">
                <ClockCircleOutlined
                  style={{ color: timeLeft < 300 ? "#ff4d4f" : "#1890ff" }}
                />
                <Text
                  strong
                  style={{
                    color: timeLeft < 300 ? "#ff4d4f" : "#1890ff",
                    marginLeft: 8,
                  }}
                >
                  {formatTime(timeLeft)}
                </Text>
              </div>
              {tabSwitchCount > 0 && (
                <div className="violation-count">
                  <WarningOutlined style={{ color: "#faad14" }} />
                  <Text style={{ color: "#faad14", marginLeft: 4 }}>
                    Warnings: {tabSwitchCount}/3
                  </Text>
                </div>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <Progress
          percent={Math.round(
            (getAnsweredCount() / testData.questions.length) * 100
          )}
          status={timeLeft < 300 ? "exception" : "active"}
          format={() =>
            `${getAnsweredCount()}/${testData.questions.length} Answered`
          }
        />
      </div>

      {/* Question Navigation */}
      <div className="question-nav">
        <Space wrap>
          {testData.questions.map((_, index) => (
            <Button
              key={index}
              size="small"
              type={
                currentQuestion === index
                  ? "primary"
                  : answers[index]
                  ? "default"
                  : "dashed"
              }
              onClick={() => setCurrentQuestion(index)}
              className={answers[index] ? "answered" : ""}
            >
              {index + 1}
            </Button>
          ))}
        </Space>
      </div>

      {/* Current Question */}
      <Card className="question-card">
        <div className="question-header">
          <Title level={4}>
            Question {currentQuestion + 1} of {testData.questions.length}
          </Title>
          <Text type="secondary" className="question-type">
            Type: {testData.questions[currentQuestion]?.questionType}
          </Text>
        </div>

        <Paragraph className="question-text">
          {testData.questions[currentQuestion]?.questionText}
        </Paragraph>

        <Radio.Group
          value={answers[currentQuestion]}
          onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
          className="options-group"
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {testData.questions[currentQuestion]?.options.map(
              (option, index) => (
                <Radio key={index} value={option} className="option-radio">
                  <Text>{option}</Text>
                </Radio>
              )
            )}
          </Space>
        </Radio.Group>
      </Card>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <Space>
          <Button
            disabled={currentQuestion === 0 || submitting}
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
          >
            Previous
          </Button>

          {currentQuestion < testData.questions.length - 1 ? (
            <Button
              type="primary"
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              type="primary"
              danger
              loading={submitting}
              onClick={submitTest}
              icon={<CheckCircleOutlined />}
            >
              Submit Test
            </Button>
          )}
        </Space>
      </div>

      {/* Test Summary Sidebar */}
      <div className="test-summary">
        <Card size="small" title="Test Summary">
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <Text strong>Progress: </Text>
              <Text>
                {getAnsweredCount()}/{testData.questions.length}
              </Text>
            </div>
            <div>
              <Text strong>Time Left: </Text>
              <Text style={{ color: timeLeft < 300 ? "#ff4d4f" : "inherit" }}>
                {formatTime(timeLeft)}
              </Text>
            </div>
            <div>
              <Text strong>Current: </Text>
              <Text>Question {currentQuestion + 1}</Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default TestPage;
