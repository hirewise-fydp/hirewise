import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Spin } from 'antd';
import FieldPalette from './FieldPalette';
import axios from 'axios'; // Ensure axios is imported
import FormPreview from './FormPreview';
import axiosInstance from '../../axios/AxiosInstance';

export default function FormBuilder({ onSaveForm, job }) {

  if (!job) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }
  console.log('job', job);

  const [formTitle, setFormTitle] = useState('Job Application Form'); 
  const [formFields, setFormFields] = useState([
    {
      id: 'name',
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: true,
      editable: false,
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email address',
      required: true,
      editable: false,
    },
    {
      id: 'phone',
      type: 'text',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      required: true,
      editable: false,
    },
    {
      id: 'cv',
      type: 'file',
      label: 'CV Upload',
      placeholder: 'Upload your CV',
      required: true,
      editable: false,
      accept: '.pdf,.doc,.docx',
    },
    {
      id: 'coverLetter',
      type: 'textarea',
      label: 'Cover Letter',
      placeholder: 'Write your cover letter here',
      required: true,
      editable: false,
    },
  ]);

  
  useEffect(() => {
    if (job?.jobTitle) {
      setFormTitle(job.jobTitle);
    }
  }, [job]);

  const addField = (field) => {
    setFormFields([...formFields, { ...field, id: `field-${Date.now()}` }]);
  };

  const removeField = (id) => {
    if (['name', 'email', 'phone', 'cv', 'coverLetter'].includes(id)) {
      return; 
    }
    setFormFields(formFields.filter((field) => field.id !== id));
  };

  const updateField = (id, updates) => {
    setFormFields(formFields.map((field) => (field.id === id ? { ...field, ...updates } : field)));
  };

  const saveForm = async () => {
    try {
      const response = await axiosInstance.post('http://localhost:5000/api/v4/hr/createForm', { jobId: job?._id, fields: formFields });
      console.log('response', response)
      onSaveForm(response.data.formId);
      message.success('Form saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      message.error('Failed to save form.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ flex: 2 }}>
        <Card>
          <Input
            placeholder="Form Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            style={{ marginBottom: '16px' }}
          />
          <FormPreview
            fields={formFields}
            onRemove={removeField}
            onSubmit={() => {}} // Placeholder for form submission
            isBuilder={true}
            onUpdate={updateField}
          />
          <Button type="primary" onClick={saveForm}>
            Save Form
          </Button>
        </Card>
      </div>
      <div style={{ flex: 1 }}>
        <FieldPalette onAddField={addField} />
      </div>
    </div>
  );
}
