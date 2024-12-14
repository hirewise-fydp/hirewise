import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import CreateFormPage from "./views/Hr/CreateFormPage";
import CandidatePage from "./views/Candidate/CandidatePage";
import AuthComponent from "./components/Auth/Auth";
import "./index.css";

const Main = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthComponent />} />
        <Route path="/home" element={<App />} />
        <Route path="/create-form" element={<CreateFormPage />} />
        <Route path="/apply-here" element={<CandidatePage />} />
      </Routes>
    </Router>
  );
};

// Render the App Component
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Main />);
