import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import AuthComponent from "./components/Auth/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import CandidateForm from "./views/Candidate/CandidateForm";
import "./index.css";
import Navbar from "./components/Navbar/Navbar";
import JobFormBuilder from "./views/Hr/JobFormBuilder/JobFormBuilder";
import TestDataFormBuilder from "./views/Hr/testDataFormBuilder/TestDataFormBuilder";
import PublicFormPage from "./views/Hr/PublicFormPage/PublicFormPage";
import CreateJobFormPage from "./views/Hr/CreateJobFormPage/CreateJobFormPage";
import ConfirmationModal from "./views/Hr/hrConfirmationDialog/moduleTwoDataDialog"
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
        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HRDashboard />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/create-form"
          element={
            <ProtectedRoute>
              <JobFormBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-confirmation-dialog"
          element={
            <ProtectedRoute>
              <ConfirmationModal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-data-module-two-form"
          element={
            <ProtectedRoute>
              <TestDataFormBuilder />
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
