import React from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom';



const App = () => {
  let navigate = useNavigate();
  return (
    <div className="App">
      <h1>Form Builder</h1>
      <Button onClick={( ) => navigate('/Create-job')}>
        Create Job
      </Button>
    </div>
  )
}

export default App