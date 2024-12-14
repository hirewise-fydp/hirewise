import React from 'react'
import CreateFormPage from './views/Hr/CreateFormPage'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom';



const App = () => {
  let navigate = useNavigate();
  return (
    <div className="App">
      <h1>Form Builder</h1>
      <Button onClick={( ) => navigate('/create-form')}>
        GO TO FORM BUILDER
      </Button>
    </div>
  )
}

export default App