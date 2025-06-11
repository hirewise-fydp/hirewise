"use client";

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Typography, Space, Divider, Button, Result } from "antd";
import {
  CheckCircleOutlined,
  MailOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "./styles.css";

const { Title, Text, Paragraph } = Typography;

const PublicFormCompletion = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data passed from test submission
  const testData = location.state || {};
  const { jobTitle, candidateName, submissionTime } = testData;

  useEffect(() => {
    // Prevent back navigation to test
    const handlePopState = (event) => {
      // Push the current state again to prevent going back
      window.history.pushState(null, null, window.location.pathname);
    };

    // Add initial state
    window.history.pushState(null, null, window.location.pathname);

    // Listen for back button
    window.addEventListener("popstate", handlePopState);

    // Disable right-click and common shortcuts
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "u") ||
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return new Date().toLocaleString();
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="completion-container">
      <div className="completion-content">
        <Card className="completion-card">
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            title={
              <Title level={2} style={{ color: "#52c41a", margin: 0 }}>
                Your Application Has Been Submitted Successfully!
              </Title>
            }
            subTitle={
              <Text style={{ fontSize: "16px", color: "#666" }}>
                Thank you for taking the time to complete our assessment
              </Text>
            }
          />

          <Divider />

          <div className="completion-details">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Next Steps */}
              <Card size="small" className="next-steps-section">
                <Title level={4} style={{ color: "#1890ff", marginBottom: 16 }}>
                  What Happens Next?
                </Title>
                <Space direction="vertical" size="middle">
                  <div className="step-item">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <Text strong>Evaluation Process</Text>
                      <br />
                      <Text type="secondary">
                        Our team will carefully review your test responses and
                        evaluate your performance.
                      </Text>
                    </div>
                  </div>

                  <div className="step-item">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <Text strong>Results Notification</Text>
                      <br />
                      <Text type="secondary">
                        You will receive an email notification with your test
                        results within 2-3 business days.
                      </Text>
                    </div>
                  </div>

                  <div className="step-item">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <Text strong>Next Round</Text>
                      <br />
                      <Text type="secondary">
                        If you qualify, we'll contact you for the next stage of
                        the recruitment process.
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>

              {/* Important Notes */}
              <Card size="small" className="notes-section">
                <Title level={4} style={{ color: "#fa8c16", marginBottom: 16 }}>
                  Important Notes
                </Title>
                <ul className="notes-list">
                  <li>
                    Please check your email regularly for updates on your
                    application status
                  </li>
                  <li>Make sure to check your spam/junk folder as well</li>
                  <li>
                    Your test responses have been securely saved and cannot be
                    modified
                  </li>
                  <li>
                    If you don't hear from us within 5 business days, feel free
                    to follow up
                  </li>
                </ul>
              </Card>
            </Space>
          </div>

          <Divider />

          {/* Footer */}
          <div className="completion-footer">
            <Text
              type="secondary"
              style={{ textAlign: "center", display: "block" }}
            >
              Thank you for your interest in joining our team. We appreciate the
              time you've invested in this process.
            </Text>
          </div>
        </Card>
      </div>

      {/* Background decoration */}
      <div className="background-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default PublicFormCompletion;
