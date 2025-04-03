import React, { useEffect, useState } from 'react';
import { Button, Input, message } from 'antd';
import FormBuilder from '../../../components/form-builder/FormBuilder';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axios/AxiosInstance';


export default function JobFormBuilder() {
  const [formId, setFormId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId; 
  const [job, setJob] = useState(null);

  console.log('jobId', jobId);
  


  const fetchJd = async (id) => {
    if (!id) {
      message.error("Invalid Job ID.");
      return null;
    }
  
    try {
      const response = await axiosInstance.get(`http://localhost:5000/api/v4/hr/findJd/${id}`);
      console.log('response', response);
      
      return response.data;
    } catch (error) {
      message.error('Failed to fetch job description.');
      return null; 
    }
  };
  
  useEffect(() => {
    const getJobData = async () => {
      if (jobId) {
        const jobData = await fetchJd(jobId); 
          setJob(jobData);
      }
    };
    getJobData();
  
  }, [jobId]);
  
  
  
  const handleSaveForm = (id) => {
    setFormId(id); 
    message.success('Form saved successfully!', id);
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>HR Form Management System</h1>
      
      {/* Render the FormBuilder component */}
      <FormBuilder onSaveForm={handleSaveForm} job={job} />

      {/* Show the Form Link and Copy Link button after saving the form */}
      {formId && (
        <div style={{ marginTop: '20px' }}>
          <p>Form Link:</p>
          <Input
            value={`${window.location.origin}/form/${formId}`}
            readOnly
            style={{ marginBottom: '10px' }}
          />
          <Button
            type="primary"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/form/${formId}`);
              message.success('Link copied to clipboard!');
            }}
          >
            Copy Link
          </Button>
        </div>
      )}
    </div>
  );
}