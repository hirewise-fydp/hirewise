import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import CandidatePage from "./views/Candidate/CandidatePage";
import AuthComponent from "./components/Auth/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import CandidateForm from "./views/Candidate/CandidateForm";
import HRDashboard from "./views/Hr/Dashboard/HrDashboard";
import "./index.css";
import Navbar from "./components/Navbar/Navbar";
import JobFormBuilder from "./views/Hr/JobFormBuilder/JobFormBuilder";
import PublicFormPage from "./views/Hr/PublicFormPage/PublicFormPage";
import CreateJobFormPage from "./views/Hr/CreateJobFormPage/CreateJobFormPage";

const MainLayout = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/"];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <Routes>
        {/* Public Route (Only accessible if not logged in) */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <AuthComponent />
            </PublicRoute>
          }
        />

        {/* Protected Routes (With Navbar) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-job"
          element={
            <ProtectedRoute>
              <CreateJobFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-form"
          element={
            <ProtectedRoute>
              <JobFormBuilder />
            </ProtectedRoute>
          }
        />

        {/* Public Routes (Navbar still visible) */}
        <Route path="/form/:formId" element={<PublicFormPage />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

const Main = () => (
  <Provider store={store}>
    <Router>
      <MainLayout />
    </Router>
  </Provider>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
