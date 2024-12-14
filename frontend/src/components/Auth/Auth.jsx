import React, { useState } from "react";
import "../../styles/auth.css"
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const AuthComponent = () => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="container-fluid vw-100 vh-100 bg-light">
      <div className="row h-100 align-items-center justify-content-center">
        {/* Conditional Rendering for Login or Signup */}
        {!showSignup ? (
          // Login Form
          <div className=" vw-80 col-md-5 p-5 bg-white shadow rounded">
            <h3 className="text-center mb-4">
              Hi, Welcome Back! <span role="img" aria-label="wave">👋</span>
            </h3>
            <form>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" placeholder="example@gmail.com" />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="Enter Your Password" />
              </div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="rememberMe" />
                  <label className="form-check-label" htmlFor="rememberMe">Remember Me</label>
                </div>
                <a href="#" className="text-danger">Forgot Password?</a>
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
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
            <h3 className="text-center mb-4">Connect with your friends today!</h3>
            <form>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" placeholder="Enter Your Username" />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" placeholder="Enter Your Email" />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-control" placeholder="Enter Your Phone Number" />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" placeholder="Enter Your Password" />
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">Sign Up</button>
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
