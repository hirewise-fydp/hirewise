import React, { useState } from 'react';
import FormBuilder from '../../components/FormBuilder/FormBuilder';
import FormPreview from '../../components/FormBuilder/FormPreview';
import '../../styles/createForm.css';

const initialFields = [
  { id: 1, type: 'text', label: 'First name' },
  { id: 2, type: 'text', label: 'Last name' },
  { id: 3, type: 'email', label: 'Email' },
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
  

  return (
    <div className="FormPageHeroDiv">
      <FormBuilder addField={addField} />
      <FormPreview fields={fields} deleteField={deleteField} updateField={updateField} />
    </div>
  );
};

export default CreateFormPage;
