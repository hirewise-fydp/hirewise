import React from 'react';
import { Form, Input, Button, Upload, message, Switch } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { processJobDescription } from '../../../slices/jobSlice';

const CreateJobFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    const formData = new FormData();
    console.log("values" , values);
    
    formData.append('title', values.title);
    // Add automatedTesting to formData
    formData.append('modules[automatedTesting]', values.automatedTesting);

    const file = values.image?.[0]?.originFileObj;

    console.log(formData.get('title'));
    console.log("for, data", formData);
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    if (file) {
      formData.append('image', file);
    } else {
      message.error('Please upload a file.');
      return;
    }

    try {
      console.log("form data : ", formData)
      const resultAction = await dispatch(processJobDescription(formData));
      if (processJobDescription.fulfilled.match(resultAction)) {
        message.success('Job description processed successfully!');
        console.log('Saved Job ID:', resultAction.payload);
        navigate('/create-form', { state: { jobId: resultAction.payload } });
      } else {
        console.log('resultAction.payload', resultAction.payload);
        message.error(resultAction.payload || 'Failed to process job description.');
      }
    } catch (error) {
      message.error('An error occurred.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Form
        name="create-job-form"
        onFinish={onFinish}
        layout="vertical"
        style={{ width: '400px', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <Form.Item
          label={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>Job Title</span>}
          name="title"
          rules={[{ required: true, message: 'Please input the job title!' }]}
        >
          <Input placeholder="Enter the job title" size="large" />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>Upload File</span>}
          name="image"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload beforeUpload={() => false} maxCount={1}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>Automated Testing Module</span>}
          name="automatedTesting"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            Create
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateJobFormPage;