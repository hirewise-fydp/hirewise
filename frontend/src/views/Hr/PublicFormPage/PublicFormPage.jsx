import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Alert, Card } from 'antd';
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

  const handleSubmit = (data) => {
    console.log('Form submitted:', data);

  };

  if (isLoading) return <Spin size="large" />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <Card title={formConfig?.title || 'Form Preview'}>
      <PublicForm fields={formConfig?.fields || []} onSubmit={handleSubmit} />
    </Card>
  );
}
