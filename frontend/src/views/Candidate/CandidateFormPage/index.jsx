import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Alert, Card, message, Descriptions, Button, Row, Col, Modal } from 'antd';
import PublicForm from '../../../components/public-form/PublicForm';
import axiosInstance from '../../../axios/AxiosInstance';
import './PublicFormPage.css'; // Custom CSS for tweaks
import {
  WarningOutlined,
} from "@ant-design/icons"
export default function PublicFormPage() {
  const { formId } = useParams();
  const [formConfig, setFormConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchFormConfig = async () => {
      if (!formId) return;
      try {
        const response = await axiosInstance.get(`/api/v4/hr/getForm/${formId}`);
        if (response.data) {
          console.log('Form configuration:', response.data); // Debug log
          setFormConfig(response.data);
          // Show modal if job is inactive
          if (response.data.job && !response.data.job.isActive) {
            setIsModalVisible(true);
          }
        } else {
          setError('No form configuration found');
        }
      } catch (err) {
        setError('Failed to load form configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormConfig();
  }, [formId]);

  const handleSubmit = async (data) => {
    try {
      console.log('Submitted data:', data); // Debug log
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (Array.isArray(data[key])) {
          // Handle arrays (e.g., checkboxes)
          data[key].forEach((value, index) => {
            formData.append(`${key}[${index}]`, value);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await axiosInstance.post(`/api/v4/candidate/apply/${formId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success(response.data.message || 'Application submitted successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      message.error(errorMessage);
    }
  };
  if (isLoading) return <div className="loading-container"><Spin size="large" /></div>;
  if (error) return <Alert message={error} type="error" className="error-alert" />;

  return (
    <div className="public-form-page">
      <div className="container">
        <h1 className="page-title">{formConfig?.job?.jobTitle || 'Job Application'}</h1>
        {formConfig?.job?.isActive ? (
          <Row gutter={[16, 16]}>
            {/* Left: Form Fields */}
            <Col xs={24} lg={12}>
              <Card title="Application Form" className="form-card">
                <PublicForm fields={formConfig?.fields || []} onSubmit={handleSubmit} />
              </Card>
            </Col>
            {/* Right: Job Details */}
            <Col xs={24} lg={12}>
              <Card title="Job Details" className="form-card">
                {formConfig?.job ? (
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Job Title">
                      {formConfig.job.jobTitle || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Location">
                      {formConfig.job.jobLocation || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Job Type">
                      {formConfig.job.jobType || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Employment Type">
                      {formConfig.job.employmentType || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Application Period">
                      {formConfig.job.activeDuration?.startDate && formConfig.job.activeDuration?.endDate
                        ? `${new Date(formConfig.job.activeDuration.startDate).toLocaleDateString()} - ${new Date(
                            formConfig.job.activeDuration.endDate
                          ).toLocaleDateString()}`
                        : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Job Description">
                      {formConfig.job.file?.url ? (
                        <Button
                          type="link"
                          href={formConfig.job.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Job Description ({formConfig.job.file.format.toUpperCase()})
                        </Button>
                      ) : (
                        'No file available'
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      {formConfig.job.status || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Active">
                      {formConfig.job.isActive ? 'Yes' : 'No'}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <p>No job details available</p>
                )}
              </Card>
            </Col>
          </Row>
        ) : (
           <Alert
          message={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <WarningOutlined style={{ marginRight: 8 }} />
                <span>
                 The job is currently in active.
                </span>
              </div>
              {/* <Button icon={<CopyOutlined />} onClick={handleCopyFormLink}>
                Copy Form Link
              </Button> */}  
            </div>
          }
          type="warning"
          showIcon={false}
          style={{ marginBottom: 16 }}
        />
          
        )}
      </div>
    </div>
  );
}