import React, { useState } from "react";
import "antd/dist/reset.css";
import { Steps, Button, Form, Input, Select, Row, Col, Typography, message } from "antd";
import { useDispatch } from "react-redux";
import { login, register } from "../../slices/authSlice";
import "../../styles/auth.css";

const { Title } = Typography;
const { Option } = Select;

// Login form component
const LoginForm = ({ onSubmit }) => (
  <Form
    layout="vertical"
    onFinish={onSubmit}
    initialValues={{ email: "", password: "" }}
  >
    <Form.Item
      label="Email"
      name="email"
      rules={[
        { required: true, message: "Email is required" },
        { type: "email", message: "Invalid email format" },
      ]}
    >
      <Input placeholder="Email" />
    </Form.Item>
    <Form.Item
      label="Password"
      name="password"
      rules={[
        { required: true, message: "Password is required" },
        { min: 6, message: "Password must be at least 6 characters" },
      ]}
    >
      <Input.Password placeholder="Password" />
    </Form.Item>
    <Button type="primary" htmlType="submit" className="w-100">
      Login
    </Button>
  </Form>
);

// Signup form component
const SignupForm = ({ onSubmit, role }) => (
  <Form
    layout="vertical"
    onFinish={onSubmit}
    initialValues={{ name: "", email: "", password: "", role }}
  >
    <Form.Item
      label="Name"
      name="name"
      rules={[{ required: true, message: "Name is required" }]}
    >
      <Input placeholder="Name" />
    </Form.Item>
    <Form.Item
      label="Email"
      name="email"
      rules={[
        { required: true, message: "Email is required" },
        { type: "email", message: "Invalid email format" },
      ]}
    >
      <Input placeholder="Email" />
    </Form.Item>
    <Form.Item
      label="Password"
      name="password"
      rules={[
        { required: true, message: "Password is required" },
        { min: 6, message: "Password must be at least 6 characters" },
      ]}
    >
      <Input.Password placeholder="Password" />
    </Form.Item>
    <Button type="primary" htmlType="submit" className="w-100">
      Register
    </Button>
  </Form>
);

// Role selection component
const RoleSelection = ({ setStep, setRole }) => (
  <Row justify="center" align="middle" className="vh-100 bg-light">
    <Col xs={22} sm={16} md={12} lg={8} className="p-4 bg-white shadow rounded">
      <Title level={3} className="text-center mb-4">
        Select Role
      </Title>
      <Select
        placeholder="Choose your role"
        className="w-100"
        onChange={(value) => {
          setRole(value);
          setStep(3); // Proceed to the signup step after selecting the role
        }}
      >
        <Option value="HR">HR</Option>
        <Option value="Admin">Admin</Option>
      </Select>
    </Col>
  </Row>
);

// AuthComponent
const AuthComponent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [role, setRole] = useState(null);
  const dispatch = useDispatch();

  const onSubmit = async (values) => {
    if (currentStep === 1) {
      const result = await dispatch(login(values));
      if (result.type === "auth/login/fulfilled") {
        message.success("Login successful!");
      } else {
        message.error("Login failed");
      }
    } else if (currentStep === 3) {
      const result = await dispatch(register({ ...values, role }));
      if (result.type === "auth/register/fulfilled") {
        message.success("Signup successful!");
        setCurrentStep(0); // Reset to first step after success
      } else {
        message.error("Signup failed");
      }
    }
  };

  const steps = [
    {
      title: "Choose Option",
      content: (
        <Row justify="center" align="middle" className="vh-100 bg-light">
          <Col xs={22} sm={16} md={12} lg={8} className="p-4 bg-white shadow rounded">
            <Title level={3} className="text-center mb-4">
              Welcome!
            </Title>
            <div className="d-flex justify-content-around">
              <Button
                type="primary"
                onClick={() => setCurrentStep(1)}
                className="w-45"
              >
                Login
              </Button>
              <Button
                type="primary"
                onClick={() => setCurrentStep(2)}
                className="w-45"
              >
                Signup
              </Button>
            </div>
          </Col>
        </Row>
      ),
    },
    { title: "Login", content: <LoginForm onSubmit={onSubmit} /> },
    { title: "Select Role", content: <RoleSelection setStep={setCurrentStep} setRole={setRole} /> },
    { title: "Signup", content: <SignupForm onSubmit={onSubmit} role={role} /> },
  ];

  return (
    <div className="auth-container">
      <Steps
        current={currentStep}
        onChange={setCurrentStep}
        className="mb-4"
        progressDot
      >
        {steps.map((step, index) => (
          <Steps.Step key={index} title={step.title} />
        ))}
      </Steps>
      <div>{steps[currentStep].content}</div>
      {currentStep === 2 && (
        <Button
          type="primary"
          onClick={() => {
            if (role) {
              setCurrentStep(3); // Only proceed if role is selected
            } else {
              message.error("Please select a role first!");
            }
          }}
          disabled={!role}  // Disable button if role is not selected
          className="w-100 mt-4"
        >
          Proceed to Signup
        </Button>
      )}
    </div>
  );
};

export default AuthComponent;
