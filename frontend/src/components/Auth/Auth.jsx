import React, { useState } from "react";
import "antd/dist/reset.css";
import { Button, Col, Form, Input, Select, Row, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../../slices/authSlice";
import '../../styles/auth.css'

const { Title, Text } = Typography;
const { Option } = Select;

const AuthComponent = () => {
  const [showSignup, setShowSignup] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleFormSubmit = async (values) => {
    if (showSignup) {
      // Dispatch signup action
      const result = await dispatch(register(values));
      console.log(result);

      if (result.type === "auth/register/fulfilled") {
        setShowSignup(false);
        message.success("Signup successful! Please log in.");
      } else {
        message.error(result.payload || "Signup failed.");
      }
    } else {
      const { email, password } = values;
      const result = await dispatch(login({ email, password }));

      if (result.type === "auth/login/fulfilled") {
        message.success("Login successful!");
        navigate("/home");
      } else {
        message.error(result.payload || "Login failed.");
      }
    }
  };

  const commonFormItems = [
    {
      name: "email",
      label: "Email",
      rules: [
        { required: true, message: "Please enter your email!" },
        { type: "email", message: "Please enter a valid email!" },
      ],
      input: <Input placeholder="Email" />,
    },
    {
      name: "password",
      label: "Password",
      rules: [
        { required: true, message: "Please enter your password!" },
      ],
      input: <Input.Password placeholder="Password" />,
    },
  ];

  return (
    <Row justify="center" align="middle" className="vh-100 bg-light" colorBorder='black'>
      <Col xs={22} sm={16} md={12} lg={8} className="p-4 bg-white shadow rounded">
        <Title level={3} className="text-center mb-4">
          {showSignup ? "Connect with your friends today!" : "Hi, Welcome Back! 👋"}
        </Title>

        <Form layout="vertical" onFinish={handleFormSubmit}>
          {showSignup && (
            <>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter your name!" }]}
              >
                <Input placeholder="Name" />
              </Form.Item>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select a role!" }]}
              >
                <Select placeholder="Select a role">
                  <Option value="HR">HR</Option>
                  <Option value="Admin">Admin</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {commonFormItems.map(({ name, label, rules, input }) => (
            <Form.Item key={name} name={name} label={label} rules={rules}>
              {input}
            </Form.Item>
          ))}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-100"
              loading={loading}
            >
              {showSignup ? "Sign Up" : "Login"}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text>
            {showSignup
              ? "Already have an account? "
              : "Don't have an account? "}
            <Text
              type="primary"
              style={{ cursor: "pointer" }}
              onClick={() => setShowSignup(!showSignup)}
            >
              {showSignup ? "Login" : "Sign Up"}
            </Text>
          </Text>
        </div>
      </Col>
    </Row>
  );
};

export default AuthComponent;




// // import React, { useState } from 'react';
// // import { Button, Col, Form, Input, Row, Typography, message } from 'antd';
// // import { useDispatch, useSelector } from 'react-redux';
// // import { login } from '../../slices/authSlice';
// // import { useNavigate } from 'react-router-dom';

// // const { Title } = Typography;

// // const AuthComponent = () => {
// //   const [loading, setLoading] = useState(false);
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();

// //   const handleFormSubmit = async (values) => {
// //     setLoading(true);
// //     try {
// //       const result = await dispatch(login(values)).unwrap();
// //       message.success('Login successful!');
// //       console.log('Login result:', result);
// //       navigate('/home');
// //     } catch (error) {
// //       message.error(error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Row justify="center" align="middle" className="vh-100 bg-light">
// //       <Col xs={22} sm={16} md={12} lg={8} className="p-4 bg-white shadow rounded">
// //         <Title level={3} className="text-center mb-4">
// //           Hi, Welcome Back!
// //         </Title>

// //         <Form layout="vertical" onFinish={handleFormSubmit}>
// //           <Form.Item
// //             name="email"
// //             label="Email"
// //             rules={[{ required: true, message: 'Please enter your email!' }]}
// //           >
// //             <Input placeholder="Email" />
// //           </Form.Item>
// //           <Form.Item
// //             name="password"
// //             label="Password"
// //             rules={[{ required: true, message: 'Please enter your password!' }]}
// //           >
// //             <Input.Password placeholder="Password" />
// //           </Form.Item>
// //           <Form.Item>
// //             <Button type="primary" htmlType="submit" className="w-100" loading={loading}>
// //               Login
// //             </Button>
// //           </Form.Item>
// //         </Form>
// //       </Col>
// //     </Row>
// //   );
// // };

// // export default AuthComponent;


// import React, { useState } from "react";
// import "antd/dist/reset.css";
// import { Button, Col, Form, Input, Row, Typography, Checkbox } from "antd";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { login } from "../../slices/authSlice";
// import "../../styles/auth.css"

// const { Title, Text } = Typography;

// const AuthComponent = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { loading } = useSelector((state) => state.auth);

//   const handleLogin = async (values) => {
//     const { email, password } = values;
//     const result = await dispatch(login({ email, password }));
//     if (result.type === "auth/register/fulfilled") {
//       setShowSignup(false);
//       message.success("Signup successful! Please log in.");
//       navigate('/home')
//     } else {
//       message.error(result.payload || "Signup failed.");
//     }
//   };

//   return (
//     <Row justify="center" align="middle" className="vh-100 auth-bg">
//       <Col xs={22} sm={16} md={12} lg={8} className="auth-container">
//         {/* Header */}
//         <Title level={3} className="auth-title">
//           Welcome to HIREWISE <span className="wave">v</span>
//         </Title>

//         {/* Login Form */}
//         <Form layout="vertical" onFinish={handleLogin} className="auth-form">
//           <Form.Item
//             name="email"
//             rules={[{ required: true, type: "email", message: "Enter a valid email!" }]}
//           >
//             <Input placeholder="Email" className="auth-input" />
//           </Form.Item>

//           <Form.Item
//             name="password"
//             rules={[{ required: true, message: "Enter your password!" }]}
//           >
//             <Input.Password placeholder="Password" className="auth-input" />
//           </Form.Item>

//           <div className="auth-options">
//             <Checkbox>Remember Me</Checkbox>
//             <Text className="forgot-password">Forgot Password?</Text>
//           </div>

//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               className="auth-button"
//               loading={loading}
//             >
//               Login
//             </Button>
//           </Form.Item>
//         </Form>

//         {/* Sign Up Link */}
//         <div className="auth-signup">
//           <Text>Don't have an account? </Text>
//           <Text strong className="signup-link">
//             Sign Up
//           </Text>
//         </div>

//         {/* Facebook Button */}
//         {/* <div className="social-login">
//           <Button className="facebook-button">Login with Facebook</Button>
//         </div> */}
//       </Col>
//     </Row>
//   );
// };

// export default AuthComponent;