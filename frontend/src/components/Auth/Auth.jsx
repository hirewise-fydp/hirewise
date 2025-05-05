import React, { useState } from "react";
import "antd/dist/reset.css";
import { Steps, Button, Form, Input, Typography, message, Divider } from "antd";
import { useDispatch } from "react-redux";
import { login, register } from "../../slices/authSlice";
import "../../styles/auth.css";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const AuthComponent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [authOption, setAuthOption] = useState(null);
  const [role, setRole] = useState(null);
  const dispatch = useDispatch();
  let navigate = useNavigate();


  const onSubmit = async (values) => {
    try {
      if (authOption === "login") {
        const result = await dispatch(login(values));
        if (result.type === "auth/login/fulfilled") {
          message.success("Login successful!");
          navigate('/dashboard')
    
        } else {
          message.error("Login failed");
        }
      } else if (authOption === "signup") {
        const result = await dispatch(register({ ...values, role }));
        if (result.type === "auth/register/fulfilled") {
          message.success("Signup successful!");
          console.log("chnage")

        } else {
          message.error("Signup failed");
        }
      }
    } catch (error) {
      message.error("An error occurred. Please try again.");
    }
  };

  const steps = [
    {
      content: (
        <div className="step-container">
          <Title level={3} className="step-title">
            Choose Your Role
          </Title>
          <div style={{ width: "60%", margin: "auto" }}>
            <Divider style={{ borderColor: "#fff", borderWidth: "3px" }} />
          </div>
          <div className="role-buttons">
            <Button
              type="default"
              className="role-button"
              onClick={() => {
                setRole("HR");
                setCurrentStep(1);
              }}
            >
              HR
            </Button>
            <Button
              type="default"
              className="role-button"
              onClick={() => {
                setRole("Admin");
                setCurrentStep(1);
              }}
            >
              Admin
            </Button>
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className="step-container">
          <Title level={3} className="step-title">
            Choose Authentication
          </Title>
          <p style={{ color: "white", fontSize: "16px" }}>
            Selected User Type: {role}
          </p>
          <div style={{ width: "60%", margin: "auto" }}>
            <Divider style={{ borderColor: "#fff", borderWidth: "3px" }} />
          </div>
          <div className="auth-buttons">
            <Button
              type="default"
              className="auth-button"
              onClick={() => {
                setAuthOption("login");
                setCurrentStep(2);
              }}
            >
              Login
            </Button>
            <Button
              type="default"
              className="auth-button"
              onClick={() => {
                setAuthOption("signup");
                setCurrentStep(2);
              }}
            >
              Signup
            </Button>
          </div>
          <Button
            className="back-button"
            onClick={() => setCurrentStep(0)}
            style={{ marginTop: 20 }}
          >
            <ArrowLeftOutlined />
            Back
          </Button>
        </div>
      ),
    },
    {
      content: (
        <div className="step-container">
          <Title level={3} className="step-title">
            {authOption === "login"
              ? `Sign In as ${role}`
              : `Sign Up as ${role}`}
          </Title>
          <div style={{ width: "60%", margin: "auto" }}>
            <Divider style={{ borderColor: "#fff", borderWidth: "3px" }} />
          </div>
          <Form layout="vertical" onFinish={onSubmit} initialValues={{ role }}>
            {authOption === "signup" && (
              <Form.Item
                label={<span style={{ color: "white" }}>Name</span>}
                name="name"
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input placeholder="Name" />
              </Form.Item>
            )}
            <Form.Item
              label={<span style={{ color: "white" }}>Email</span>}
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Invalid email format",
                },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: "white" }}>Password</span>}
              name="password"
              rules={[
                {
                  required: true,
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <div className="auth-page-button-divs">
              <Button
                className="submit-button auth-back-button"
                onClick={() => setCurrentStep(1)}
                style={{ marginTop: 20 }}
              >
                <ArrowLeftOutlined /> Back
              </Button>
              <Button htmlType="submit" className="submit-button">
                {authOption === "login" ? "Login" : "Signup"}
              </Button>
            </div>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <div className="parent">
      <div className="auth-container">
        <Steps
          current={currentStep}
          className="steps-container large-steps"
          progressDot
        >
          {steps.map((_, index) => (
            <Steps.Step key={index} />
          ))}
        </Steps>
        <div className="step-content">{steps[currentStep].content}</div>
      </div>
    </div>
  );
};

export default AuthComponent;