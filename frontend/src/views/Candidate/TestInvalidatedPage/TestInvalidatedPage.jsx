"use client";

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Typography, Space, Button, Result, Alert } from "antd";
import {
  CloseCircleOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import "./styles.css";

const { Title, Text, Paragraph } = Typography;

const TestInvalidatedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data passed from test invalidation
  const invalidationData = location.state || {};
  const { reason, jobTitle, timestamp } = invalidationData;

  useEffect(() => {
    // Prevent back navigation
    const handlePopState = (event) => {
      window.history.pushState(null, null, window.location.pathname);
    };

    // Add initial state
    window.history.pushState(null, null, window.location.pathname);

    // Listen for back button
    window.addEventListener("popstate", handlePopState);

    // Disable right-click and shortcuts
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
    <div className="invalidated-container">
      <div className="invalidated-content">
        <Card className="invalidated-card">
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
            title={
              <Title level={2} style={{ color: "#ff4d4f", margin: 0 }}>
                Test Invalidated
              </Title>
            }
            subTitle={
              <Text style={{ fontSize: "16px", color: "#666" }}>
                Your test session has been terminated due to policy violations
              </Text>
            }
          />

          <div className="invalidation-details">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Invalidation Information */}
              <Alert
                message="Reason for Invalidation"
                description={
                  reason ||
                  "Multiple policy violations detected during the test session"
                }
                type="error"
                showIcon
                icon={<ExclamationCircleOutlined />}
              />

              {/* What This Means */}
              <Card size="small" className="explanation-section">
                <Title level={4} style={{ color: "#ff4d4f", marginBottom: 16 }}>
                  What This Means
                </Title>
                <ul className="explanation-list">
                  <li>Your test responses have not been recorded</li>
                  <li>This test session is considered incomplete</li>
                  <li>You may be disqualified from this application process</li>
                  <li>All test activity has been logged for review</li>
                </ul>
              </Card>

              {/* Contact Information */}
              <Card size="small" className="contact-section">
                <Title level={4} style={{ color: "#1890ff", marginBottom: 16 }}>
                  Need to Appeal?
                </Title>
                <Space direction="vertical" size="small">
                  <div className="contact-item">
                    <MailOutlined
                      style={{ color: "#1890ff", marginRight: 8 }}
                    />
                    <Text>
                      If you believe this was an error, please contact:
                    </Text>
                  </div>
                  <Text strong style={{ marginLeft: 24 }}>
                    hr@company.com
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 24 }}>
                    Include your name, position applied for, and details about
                    the technical issue.
                  </Text>
                </Space>
              </Card>
            </Space>
          </div>

          {/* Footer */}
          <div className="invalidated-footer">
            <Text
              type="secondary"
              style={{
                textAlign: "center",
                display: "block",
                marginBottom: 16,
              }}
            >
              We take test integrity seriously to ensure fairness for all
              candidates.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestInvalidatedPage;
