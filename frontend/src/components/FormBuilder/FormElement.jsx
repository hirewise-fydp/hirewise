import { Input, Button } from 'antd';
import React, { useState } from 'react';
import { EditOutlined, DeleteOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';

const FormElement = ({ field, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(field.label);
  const [options, setOptions] = useState(field.options || []);

  const handleSave = () => {
    onUpdate(field.id, { label, options }); // Update label and options
    setIsEditing(false); // Exit editing mode
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  return (
    <div className="form-element" style={{ marginBottom: '20px' }}>
      {/* Field Label Input */}
      <Input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        disabled={!isEditing}
        placeholder="Enter field label"
        style={{ marginBottom: '10px', width: '100%' }}
        suffix={
          <>
            {!isEditing ? (
              <EditOutlined
                onClick={() => setIsEditing(true)}
                style={{ cursor: 'pointer', color: 'blue', marginRight: '10px' }}
              />
            ) : (
              <SaveOutlined
                onClick={handleSave}
                style={{ cursor: 'pointer', color: 'green', marginRight: '10px' }}
              />
            )}
            <DeleteOutlined
              onClick={() => onDelete(field.id)}
              style={{ cursor: 'pointer', color: 'red' }}
            />
          </>
        }
      />

      {/* Options Input for Select/Radio */}
      {isEditing && (field.type === 'select' || field.type === 'radio') && (
        <div style={{ marginTop: '10px' }}>
          <h4>Options</h4>
          {options.map((option, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                style={{ width: '150px' }}
              />
            </div>
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addOption}
            style={{ marginTop: '10px' }}
          >
            Add Option
          </Button>
        </div>
      )}
    </div>
  );
};

export default FormElement;
