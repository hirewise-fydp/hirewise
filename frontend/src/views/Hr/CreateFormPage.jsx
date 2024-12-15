import React, { useState } from "react";
import FormBuilder from "../../components/FormBuilder/FormBuilder";
import FormPreview from "../../components/FormBuilder/FormPreview";
import "../../styles/createForm.css";
import axiosInstance from "../../axios/AxiosInstance";
const API_BASE_URL = "http://localhost:5000/api/v4/hr";


const initialFields = [
  { id: 1, type: "text", label: "First name" },
  { id: 2, type: "text", label: "Last name" },
  { id: 3, type: "email", label: "Email" },
];

const CreateFormPage = () => {
  const [fields, setFields] = useState(initialFields);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isCopied, setIsCopied] = useState(false); // State to track button highlight
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  console.log("FIELDS", fields);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(generatedLink)
      .then(() => {
        setIsCopied(true); // Highlight the button
        setTimeout(() => setIsCopied(false), 2000); // Remove highlight after 2 seconds
      })
      .catch((err) => console.error("Could not copy link", err));
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
  // const handleButtonClick =async  () => {
  //   const response = await axios.post(`${API_BASE_URL}/create-form`, {
  //     jobId: "15151511541541541541541",
  //     formdata: fields,
  //   });
  //   alert("Form Submitted!");
  //   console.log("Form Fields:", fields); // To check the current fields in console
  // };

  const handleButtonClick = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/create-form`, {
        jobId: "675de11118b6462062cffc18",
        formData: fields,
      });
      if (response) {
        setIsButtonDisabled(true);
        const formId = response.data.form._id;
        setGeneratedLink(`http://localhost:5173/form/${formId}`);
      }

      const data = await response.json();
    } catch {}
  };
  return (
    <>
      <div className="FormPageHeroDiv">
        <FormBuilder addField={addField} />
        <FormPreview
          fields={fields}
          deleteField={deleteField}
          updateField={updateField}
        />
      </div>
      <div className="text-center mt-4">
        <button
          className="btn btn-primary"
          onClick={handleButtonClick}
          disabled={isButtonDisabled} // Disable condition
        >
          {isButtonDisabled ? "Submitted" : "Submit"}
        </button>
      </div>
      {generatedLink && (
        <div className="alert alert-success mt-3 text-center">
          <h5>Form Link:</h5>
          <div className="d-flex justify-content-center align-items-center">
            <a
              href={generatedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="me-2"
            >
              {generatedLink}
            </a>
            <button
              onClick={copyToClipboard}
              className={`btn btn-sm ${
                isCopied ? "btn-success" : "btn-primary"
              }`}
            >
              {isCopied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateFormPage;
