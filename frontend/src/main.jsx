import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import CreateFormPage from './views/Hr/CreateFormPage';
import CandidatePage from './views/Candidate/CandidatePage';
import AuthComponent from './components/Auth/Auth';
import CreateJobFormPage from './views/Hr/CreateJobFormPage/CreateJobFormPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

const Main = () => (
  <Provider store={store}>
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<AuthComponent />} />

        {/* Protected Routes */}
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
          path="/create-form"
          element={
            <ProtectedRoute>
              <CreateFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="/apply-here" element={<CandidatePage />} />
      </Routes>
    </Router>
  </Provider>
);

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
