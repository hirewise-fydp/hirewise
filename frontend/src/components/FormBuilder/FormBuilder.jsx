import React, { useState } from 'react';
import '../../styles/formBuilder.css';
import { Divider, Input, Select, Button, Radio } from 'antd';

const { Option } = Select;

const FormBuilder = ({ addField }) => {
  const [label, setLabel] = useState('');
  const [inputType, setInputType] = useState('text');
  const [options, setOptions] = useState(['']);

  // Handle input type change
  const handleInputTypeChange = (value) => {
    setInputType(value);
    // Reset options when input type changes
    if (value !== 'select' && value !== 'radio') {
      setOptions(['']);
    }
  };

  // Handle options for select/radio
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  // Add more options for select/radio
  const addOption = () => {
    setOptions([...options, '']);
  };

  const handleAddField = () => {
    addField(inputType, label, options);
    setLabel('');
    setOptions(['']);
  };

  return (
    <div className="form-builder">
      <div className="form-elements">
        <h2>Form Elements</h2>
        <Divider />
        
        {/* Input for Label */}
        <Input
          placeholder="Enter field label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ marginBottom: '10px' }}
        />

        {/* Select for Input Type */}
        <Select
          value={inputType}
          onChange={handleInputTypeChange}
          style={{ width: '200px', marginBottom: '10px' }}
        >
          <Option value="text">Text</Option>
          <Option value="select">Select</Option>
          <Option value="radio">Radio</Option>
        </Select>

        {/* Conditionally Render Input Options */}
        {inputType === 'select' || inputType === 'radio' ? (
          <div style={{ marginTop: '10px' }}>
            <h4>Options</h4>
            {options.map((option, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px' }}>
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={{ width: '150px' }}
                />
              </div>
            ))}
            <Button type="dashed" onClick={addOption} style={{ marginTop: '10px' }}>
              Add Option
            </Button>
          </div>
        ) : null}

        <Button
          type="primary"
          onClick={handleAddField}
          style={{ marginTop: '20px' }}
          disabled={label==''}
        >
          Add Custom Field
        </Button>
      </div>
    </div>
  );
};

export default FormBuilder;
