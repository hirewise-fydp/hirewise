import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HRPortal from './components/HrPortal.jsx';
import CandidateForm from './components/CandidateForm.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
    <Routes>
      {/* <Route path="/" element={<HRJobInsights />} /> */}
      <Route path="/" element={<HRPortal />} />
      <Route path="/form/:formId" element={<CandidateForm />} />
    </Routes>
  </Router>
  </StrictMode>
)




