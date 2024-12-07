import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CandidateForm = () => {
  console.log("here")
  const { formId } = useParams(); // Get formId from URL
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getformdata/${formId}`);
        console.log("response:",response)
        if (response.ok) {
          const data = await response.json();
          setFields(data.fields);
        } else {
          alert("Form not found!");
        }
      } catch (error) {
        console.error("Error fetching form:", error);
        alert("Something went wrong!");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const submittedData = {};
    fields.forEach((field) => {
      if (field.type === "file") {
        submittedData[field.name] = formData.get(field.name).name;
      } else {
        submittedData[field.name] = formData.get(field.name);
      }
    });

    console.log("Submitted Data:", submittedData);
    alert("Form submitted successfully!");
  };

  if (loading) {
    return <div>Loading form...</div>;
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
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Job Application Form</h2>
      <form onSubmit={handleSubmit}>
        {fields.map((field, index) => (
          <div key={index} style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              {field.name}
            </label>
            {field.type === "text" && (
              <input
                type="text"
                name={field.name}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            )}
            {field.type === "number" && (
              <input
                type="number"
                name={field.name}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            )}
            {field.type === "file" && (
              <input
                type="file"
                name={field.name}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            )}
            {field.type === "radio" &&
              field.options.map((option, optIndex) => (
                <div key={optIndex} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={field.name}
                    id={`${field.name}-${optIndex}`}
                    value={option}
                    required
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`${field.name}-${optIndex}`}
                  >
                    {option}
                  </label>
                </div>
              ))}
          </div>
        ))}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: "#28a745",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CandidateForm;
