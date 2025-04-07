import React, { useEffect, useState } from "react";
import { Button, Input, Card, message } from "antd";
import FormPreview from "../../../components/form-builder/FormPreview";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../axios/AxiosInstance";

export default function TestDataFormBuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId;
  const [formId, setFormId] = useState(null);

  console.log(jobId);
  const [formFields, setFormFields] = useState([
    {
      id: "Experience",
      type: "text",
      label: "Experience",
      placeholder: "Enter the Experience i.e 2.5y",
      required: true,
      editable: false,
    },
    {
      id: "ConceptualQuestions",
      type: "number",
      label: "Conceptual Questions",
      placeholder: "Number of conceptual questions",
      questionType: "conceptual",
      required: true,
      editable: false,
    },
    {
      id: "LogicalQuestions",
      type: "number",
      label: "Logical Questions",
      placeholder: "Number of logical questions",
      questionType: "logical",
      required: true,
      editable: false,
    },
    {
      id: "BasicQuestions",
      type: "number",
      label: "Basic Questions",
      placeholder: "Number of basic questions",
      questionType: "basic",
      required: true,
      editable: false,
    },
    {
      id: "Difficultylevel",
      type: "select",
      label: "Difficulty Level",
      placeholder: "Difficulty level 1-10",
      required: true,
      options:["easy", "medium", "high"],
      editable: false,
    }
  ]);
  const [job, setJob] = useState(null);

  console.log("jobId", jobId);

  const fetchJd = async (id) => {
    console.log("data lana hai ");
    if (!id) {
      message.error("Invalid Job ID.");
      return null;
    }

    try {
      const response = await axiosInstance.get(
        `http://localhost:5000/api/v4/hr/findJd/${id}`
      );
      console.log("response", response);

      return response.data;
    } catch (error) {
      message.error("Failed to fetch job description.");
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
    message.success("Form saved successfully!", id);
    navigate("/home");
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        HR Form Management System
      </h1>

      {/* Render the FormBuilder component */}

      <Card>
        <Input
          placeholder="Form Title"
          value={job?.jobTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          style={{ marginBottom: "16px" }}
        />
        <FormPreview
          fields={formFields}
          onSubmit={handleSaveForm} // Placeholder for form submission
          isBuilder={false}
        />
      </Card>

      {/* Show the Form Link and Copy Link button after saving the form */}
    </div>
  );
}
