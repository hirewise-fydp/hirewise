import React from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';




const App = () => {
  let navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  return (
    <div className="App">
      
    </div>
  )
}

export default App