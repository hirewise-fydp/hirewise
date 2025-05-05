import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Alert, Card, message } from 'antd';
import PublicForm from '../../../components/public-form/PublicForm';
import axiosInstance from '../../../axios/AxiosInstance';

export default function PublicFormPage() {
  const { formId } = useParams();
  const [formConfig, setFormConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormConfig = async () => {
      if (!formId) return;
      try {
        const response = await axiosInstance.get(`/api/v4/hr/getForm/${formId}`);
        if (response.data) {
          console.log('Form configuration:', response.data); // Debug log
          
          setFormConfig(response.data);
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
        if (data[key] instanceof File){
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

  if (isLoading) return <Spin size="large" />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <Card title={formConfig?.title || 'Form Preview'}>
      <PublicForm fields={formConfig?.fields || []} onSubmit={handleSubmit} />
    </Card>
  );
}