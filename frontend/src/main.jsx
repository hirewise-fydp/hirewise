import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import AuthComponent from "./components/Auth/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import "./index.css";
import Navbar from "./components/Navbar/Navbar";
import JobFormBuilder from "./views/Hr/JobFormBuilder/JobFormBuilder";
import PublicFormPage from "./views/Candidate/CandidateFormPage";
import CreateJobFormPage from "./views/Hr/CreateJobFormPage/CreateJobFormPage";
import TestCreationPage from "./views/Hr/TestCreationPage";
import JobDetails from "./views/Hr/JobDetails";

import DashboardLayout from "./layouts/dashboard-layout";
import JobsScreen from './views/Hr/jobs-screen'
import ApplicantsScreen from "./views/Hr/applicants-screen"
const MainLayout = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/", "/form/:formId"];

  return (
    <>
      {!hideNavbarRoutes.some(route => 
        route === location.pathname || 
        (route.includes(":formId") && location.pathname.startsWith("/form/"))
      ) && <Navbar />}
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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<JobsScreen />} />
          <Route path="jobs" element={<JobsScreen />} />
          <Route path="applicants/:jobId" element={<ApplicantsScreen />} />
        </Route>
        <Route
          path="/create-job"
          element={
            <ProtectedRoute>
              <CreateJobFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:jobId"
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:jobId/create-test"
          element={
            <ProtectedRoute>
              <TestCreationPage />
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
        <Route path="/create-test" element={<ProtectedRoute><TestCreationPage /></ProtectedRoute>} />
        <Route
          path="/test-data-module-two-form"
          element={
            <ProtectedRoute>
              <TestCreationPage />
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
