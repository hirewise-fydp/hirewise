import React, { useState } from "react";
import FormBuilder from "../../components/FormBuilder/FormBuilder";
import FormPreview from "../../components/FormBuilder/FormPreview";
import "../../styles/createForm.css";
import axiosInstance from "../../axios/AxiosInstance";
import { useSelector } from "react-redux";
import { Button, Alert, Input, Space, message } from "antd";
import { CopyOutlined, CheckOutlined, LinkOutlined } from "@ant-design/icons";

const API_BASE_URL = "http://localhost:5000/api/v4/hr";

const initialFields = [
  { id: 1, type: "text", label: "First name" },
  { id: 2, type: "text", label: "Last name" },
  { id: 3, type: "email", label: "Email" },
];

const CreateFormPage = () => {
  const [fields, setFields] = useState(initialFields);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const jobId = useSelector((state) => state.job.jobId);

  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(generatedLink)
      .then(() => {
        setIsCopied(true);
        message.success("Link copied to clipboard!"); // Ant Design message notification
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Could not copy link", err);
        message.error("Failed to copy link.");
      });
  };

  const addField = (type, label, options = []) => {
    const newField = {
      id: fields.length + 1,
      type,
      label,
      options,
    };
    setFields([...fields, newField]);
  };

  const deleteField = (id) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const updateField = (id, updatedData) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updatedData } : field
      )
    );
  };

  const handleButtonClick = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/create-form`, {
        jobId: jobId,
        formData: fields,
      });
      if (response) {
        setIsButtonDisabled(true);
        const formId = response.data.form._id;
        setGeneratedLink(`http://localhost:5173/form/${formId}`);
        message.success("Form submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to submit form.");
    }
  };

  return (
    <div className="form-container">
      <div className="FormPageHeroDiv">
        <FormBuilder addField={addField} />
        <FormPreview
          fields={fields}
          deleteField={deleteField}
          updateField={updateField}
        />
      </div>
      <div className="text-center mt-4">
        <Button
          type="primary"
          onClick={handleButtonClick}
          disabled={isButtonDisabled}
          size="large"
        >
          {isButtonDisabled ? "Submitted" : "Submit"}
        </Button>
      </div>

      {generatedLink && (
        <Alert
          message="Form Link Generated"
          type="success"
          showIcon
          className="mt-4 text-center"
          description={
            <Space size="middle" align="center">
              <Input
                value={generatedLink}
                addonBefore={<LinkOutlined />}
                readOnly
                style={{ maxWidth: "400px" }}
              />
              <Button
                type={isCopied ? "dashed" : "primary"}
                icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
                onClick={copyToClipboard}
              >
                {isCopied ? "Copied" : "Copy"}
              </Button>
            </Space>
          }
        />
      )}
    </div>
  );
};

export default CreateFormPage;
