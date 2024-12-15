import React from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';




const App = () => {
  let navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  return (
    <div className="App">
      <h1>Hello {user.name}</h1>
      <Button onClick={( ) => navigate('/Create-job')}>
        Create Job 
      </Button>
    </div>
  )
}

export default App