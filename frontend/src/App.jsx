import React from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HRDashboard from './views/Hr/HrDashboard/index';




const App = () => {
  let navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  return (
    <div className="App">
      <HRDashboard />
    </div>
  )
}

export default App