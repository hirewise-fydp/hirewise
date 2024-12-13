import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HRPortal from './components/HrPortal.jsx';
import CandidateForm from './components/CandidateForm.jsx'
import './index.css'
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
    <Routes>
      {/* <Route path="/" element={<HRJobInsights />} /> */}
      <Route path="/" element={<HRPortal />} />
      <Route path="/form/:formId" element={<CandidateForm />} />
      <Route path="/home" element={<App />} />

    </Routes>
  </Router>
  </StrictMode>
)




