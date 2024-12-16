import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Form, Input, Button, Upload, Radio, Select, Spin, message } from "antd";
import axiosInstance from "../../axios/AxiosInstance";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const API_BASE_URL = "http://localhost:5000/api/v4/candidate";

const CandidateForm = () => {
  const { formId } = useParams();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm(); // Ant Design Form instance

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}/getformdata/${formId}`
        );
        if (response.status === 200) {
          setFields(response.data.fields);
        } else {
          message.error("Failed to load form fields.");
        }
      } catch (error) {
        console.error("Error fetching form:", error);
        message.error("Something went wrong while loading the form.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const onFinish = (values) => {
    console.log("Submitted Data:", values);
    message.success("Form submitted successfully!");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Job Application Form
      </h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {fields.map((field) => {
          switch (field.type) {
            case "text":
              return (
                <Form.Item
                  key={field._id}
                  label={field.label}
                  name={field.label}
                  rules={[{ required: field.required, message: `${field.label} is required` }]}
                >
                  <Input placeholder={`Enter ${field.label}`} />
                </Form.Item>
              );
            case "email":
              return (
                <Form.Item
                  key={field._id}
                  label={field.label}
                  name={field.label}
                  rules={[
                    { required: field.required, message: `${field.label} is required` },
                    { type: "email", message: "Please enter a valid email address!" },
                  ]}
                >
                  <Input placeholder={`Enter ${field.label}`} />
                </Form.Item>
              );
            case "file":
              return (
                <Form.Item
                  key={field._id}
                  label={field.label}
                  name={field.label}
                  rules={[{ required: field.required, message: `${field.label} is required` }]}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e && e.fileList}
                >
                  <Upload beforeUpload={() => false} listType="text">
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                </Form.Item>
              );
            case "radio":
              return (
                <Form.Item
                  key={field._id}
                  label={field.label}
                  name={field.label}
                  rules={[{ required: field.required, message: `${field.label} is required` }]}
                >
                  <Radio.Group>
                    {field.options.map((option, index) => (
                      <Radio key={index} value={option}>
                        {option}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              );
            case "select":
              return (
                <Form.Item
                  key={field._id}
                  label={field.label}
                  name={field.label}
                  rules={[{ required: field.required, message: `${field.label} is required` }]}
                >
                  <Select placeholder={`Select ${field.label}`}>
                    {field.options.map((option, index) => (
                      <Option key={index} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            default:
              return null;
          }
        })}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CandidateForm;
