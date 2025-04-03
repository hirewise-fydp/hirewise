import React, { useState } from 'react';
import { Card, Row, Col, Switch, Typography, message } from 'antd';
import useJobs from '../../hooks/useJobs';
import axiosInstance from '../../axios/AxiosInstance';

const { Title } = Typography;

export default function SettingsView() {
  const { jobs, setJobs } = useJobs(); // Assuming `useJobs` provides `setJobs`

  const updateJobModules = async (jobId, modules) => {
    try {
      const response = await axiosInstance.put(`http://localhost:5000/api/v4/hr/updateJob/${jobId}`, { modules });
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error.response?.data || error.message);
      throw error;
    }
  };

  const handleSwitchChange = async (jobId, field, value) => {
    const previousJobs = [...jobs]; 
    const updatedJobs = jobs.map(job =>
      job._id === jobId ? { ...job, modules: { ...job.modules, [field]: value } } : job
    );
    setJobs(updatedJobs);

    try {
      await updateJobModules(jobId, { ...updatedJobs.find(job => job._id === jobId).modules });
      message.success('Job settings updated successfully');
    } catch (error) {
      message.error('Failed to update job settings. Reverting...');
      setJobs(previousJobs); // Revert to the previous state on failure
    }
  };

  return (
    <Card>
      {jobs.map((job) => (
        <div key={job._id} style={{ marginBottom: 15, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
          <Title level={4}>{job.jobTitle}</Title>
          <Row justify="space-between" align="middle" style={{ marginTop: 5 }}>
            <Col>CV Screening</Col>
            <Col>
              <Switch
                checked={job.modules.cvScreening}
                onChange={(value) => handleSwitchChange(job._id, 'cvScreening', value)}
              />
            </Col>
          </Row>
          <Row justify="space-between" align="middle" style={{ marginTop: 5 }}>
            <Col>Automated Testing</Col>
            <Col>
              <Switch
                checked={job.modules.automatedTesting}
                onChange={(value) => handleSwitchChange(job._id, 'automatedTesting', value)}
              />
            </Col>
          </Row>
        </div>
      ))}
    </Card>
  );
}
