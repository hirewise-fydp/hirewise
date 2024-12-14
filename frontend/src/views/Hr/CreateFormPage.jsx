import React, { useState } from "react";
import FormBuilder from "../../components/FormBuilder/FormBuilder";
import FormPreview from "../../components/FormBuilder/FormPreview";
import axios from "axios";
import "../../styles/createForm.css";
const API_BASE_URL = "http://localhost:5000/api/v4/hr";

const initialFields = [
  { id: 1, type: "text", label: "First name" },
  { id: 2, type: "text", label: "Last name" },
  { id: 3, type: "email", label: "Email" },
];

const CreateFormPage = () => {
  const [fields, setFields] = useState(initialFields);
  console.log("FIELDS", fields);

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
      console.log("cjheck 1 ")
        
      const response = await axios.post(`${API_BASE_URL}/create-form`, {
        jobId: "675de11118b6462062cffc18",
        formData: fields,
      });
        }
        catch{

        }
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
        <button className="btn btn-primary" onClick={handleButtonClick}>
          Submit Form
        </button>
      </div>
    </>
  );
};

export default CreateFormPage;
