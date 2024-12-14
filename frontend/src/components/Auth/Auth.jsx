import React, { useState } from "react";
import "../../styles/auth.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:5000/api/user";

const AuthComponent = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [error, setError] = useState();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "HR",
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    console.log("formData:",formData)
  };
  const handleSubmit = async (e) => {
    console.log("hewfewbw")
    e.preventDefault();
    try {
        if (!showSignup) {
          const response = await axios.post(`${API_BASE_URL}/login`, {
            email: formData.email,
            password: formData.password,
          });
          alert("Login Successful!");
          console.log("response:", response);
        } else {
          const response = await axios.post(`${API_BASE_URL}/register`, formData);
          alert("Signup Successful!");
          console.log(response.data);
        }
      } catch (error) {
        // Handle the error message appropriately
        const errorMessage = error.response?.data?.message || "An error occurred";
        setError(errorMessage)
        console.error("Error:", errorMessage);
      }
  };

  return (
    <div className="container-fluid vw-100 vh-100 bg-light">
      <div className="row h-100 align-items-center justify-content-center">
        {/* Conditional Rendering for Login or Signup */}
        {!showSignup ? (
          // Login Form
          <div className=" vw-80 col-md-5 p-5 bg-white shadow rounded">
            <h3 className="text-center mb-4">
              Hi, Welcome Back!{" "}
              <span role="img" aria-label="wave">
                👋
              </span>
            </h3>
            <form>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>
                <div className="text-danger">
                    {error}
                </div>
                <a href="#" className="text-danger">
                  Forgot Password?
                </a>
              </div>
              <button  onClick={handleSubmit} type="submit" className="btn btn-primary w-100 mb-3">
                Login
              </button>
            </form>
            <div className="text-center">
              <p>
                Don't have an account?{" "}
                <span
                  className="text-primary fw-bold cursor-pointer"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowSignup(true)}
                >
                  Sign Up
                </span>
              </p>
            </div>
            <hr className="my-4" />
            <button className="btn btn-outline-primary w-100">
              <i className="fab fa-facebook me-2"></i> Login with Facebook
            </button>
          </div>
        ) : (
          // Sign Up Form
          <div className="row vw-80  vh-70 col-md-5 p-5 bg-white shadow rounded">
            <h3 className="text-center mb-4">
              Connect with your friends today!
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  className="form-control"

                  onChange={handleChange}
                  required
                >
                  <option value="HR">HR</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  className="form-control"

                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">
                Sign Up
              </button>
            </form>
            <div className="text-center">
              <p>
                Already have an account?{" "}
                <span
                  className="text-primary fw-bold"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowSignup(false)}
                >
                  Login
                </span>
              </p>
            </div>
            <hr className="my-4" />
            <button className="btn btn-outline-primary w-100">
              <i className="fab fa-facebook me-2"></i> Signup with Facebook
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthComponent;
