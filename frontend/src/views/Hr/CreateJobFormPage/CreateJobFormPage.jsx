import React from 'react';
import { Form, Input, Button, Upload } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { message  } from "antd";


const CreateJobFormPage = () => {
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    console.log('Form values:', values);
    try {
      const response = await axios.post('http://localhost:5000/api/v4/hr/process-jd', values )
      messageApi.open({
        type: 'success',
        content: response.message,
      });
    } catch (error) {
      console.log(error);
      
    }

  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      {contextHolder}
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
          rules={[{ required: true, message: 'Please upload a file!' }]}
        >
          <Upload beforeUpload={() => false} maxCount={1}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
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
