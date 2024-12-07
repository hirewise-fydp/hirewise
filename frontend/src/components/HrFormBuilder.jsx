import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
const HRFormBuilder = () => {
  const [fields, setFields] = useState([]);
  const [generatedLink, setGeneratedLink] = useState("");
  const addField = (type) => {
    const fieldName = prompt("Enter field name:");
    if (fieldName) {
      if (type === "radio") {
        const options = prompt("Enter comma-separated options for radio buttons:");
        setFields([...fields, { name: fieldName, type, options: options.split(",") }]);
      } else {
        setFields([...fields, { name: fieldName, type }]);
      }
    }
  };

  // Edit a field
  const editField = (index) => {
    const newFieldName = prompt("Enter new field name:", fields[index].name);
    if (newFieldName) {
      let updatedField = { ...fields[index], name: newFieldName };

      if (fields[index].type === "radio") {
        const newOptions = prompt(
          "Enter new comma-separated options for radio buttons:",
          fields[index].options.join(",")
        );
        updatedField.options = newOptions.split(",");
      }

      const updatedFields = [...fields];
      updatedFields[index] = updatedField;
      setFields(updatedFields);
    }
  };

  // Remove a field
  const removeField = (index) => {
    if (window.confirm("Are you sure you want to remove this field?")) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  // Handle drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedFields = Array.from(fields);
    const [removed] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, removed);

    setFields(reorderedFields);
  };

  // Generate form link
  const generateForm = async () => {
    const response = await fetch("http://localhost:5000/save-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    const data = await response.json();
    setGeneratedLink(`http://localhost:5173/form/${data.formId}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Create a Job Application Form</h2>
      <div className="d-flex justify-content-center mb-3">
        <button className="btn btn-primary mx-2" onClick={() => addField("text")}>
          <i className="bi bi-pencil-square"></i> Add Text Field
        </button>
        <button className="btn btn-primary mx-2" onClick={() => addField("number")}>
          <i className="bi bi-123"></i> Add Number Field
        </button>
        <button className="btn btn-primary mx-2" onClick={() => addField("file")}>
          <i className="bi bi-file-earmark-arrow-up"></i> Add File Upload Field
        </button>
        <button className="btn btn-primary mx-2" onClick={() => addField("radio")}>
          <i className="bi bi-ui-radios"></i> Add Radio Buttons
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div
              className="card p-3 mb-3"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <h3 className="text-center">Form Preview</h3>
              {fields.length === 0 && (
                <p className="text-muted text-center">No fields added yet.</p>
              )}
              {fields.map((field, index) => (
                <Draggable key={index} draggableId={`field-${index}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="mb-3 border rounded p-2"
                    >
                      <label className="form-label">{field.name}</label>
                      {field.type === "text" && (
                        <input type="text" className="form-control" disabled />
                      )}
                      {field.type === "number" && (
                        <input type="number" className="form-control" disabled />
                      )}
                      {field.type === "file" && (
                        <input type="file" className="form-control" disabled />
                      )}
                      {field.type === "radio" &&
                        field.options.map((option, optIndex) => (
                          <div key={optIndex} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name={field.name}
                              id={`${field.name}-${optIndex}`}
                              disabled
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`${field.name}-${optIndex}`}
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      <div className="d-flex mt-2">
                        <button
                          className="btn btn-secondary btn-sm me-2"
                          onClick={() => editField(index)}
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeField(index)}
                        >
                          <i className="bi bi-trash"></i> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="text-center">
        <button className="btn btn-success" onClick={generateForm}>
          <i className="bi bi-link-45deg"></i> Generate Form Link
        </button>
      </div>
      {generatedLink && (
        <div className="alert alert-success mt-3 text-center">
          <h5>Form Link:</h5>
          <a href={generatedLink} target="_blank" rel="noopener noreferrer">
            {generatedLink}
          </a>
        </div>
      )}
    </div>
  );
};

export default HRFormBuilder;
