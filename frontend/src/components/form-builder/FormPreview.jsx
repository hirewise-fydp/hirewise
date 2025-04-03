import React from 'react';
import { Card, Input, Button, Select, Checkbox, DatePicker, Switch } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const FormField = ({ field, onRemove, onUpdate, isBuilder }) => {
  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return <Input placeholder={field.placeholder} />;
      case 'email':
        return <Input type="email" placeholder={field.placeholder} />;
      case 'number':
        return <Input type="number" placeholder={field.placeholder} />;
      case 'textarea':
        return <TextArea placeholder={field.placeholder} />;
      case 'select':
        return (
          <Select placeholder={field.placeholder}  style={{ width: '100%' }}>
            {field.options?.map((option, index) => (
              <Option key={index} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        );
      case 'checkbox':
        return (
          <Checkbox.Group>
            {field.options?.map((option, index) => (
              <Checkbox key={index} value={option}>
                {option}
              </Checkbox>
            ))}
          </Checkbox.Group>
        );
      case 'date':
        return <DatePicker style={{ width: '100%' }} />;
      case 'file':
        return <Input type="file" accept={field.accept} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{field.label}</span>
            {field.required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
          </div>
          {isBuilder && field.editable && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={field.required}
                onChange={(checked) => onUpdate(field.id, { required: checked })}
                size="small"
              />
              <Button
                icon={<DeleteOutlined />}
                onClick={() => onRemove(field.id)}
                type="text"
                danger
              />
            </div>
          )}
        </div>
        {renderInput()}
      </Card>
    </div>
  );
};

export default function FormPreview({ fields, onRemove, onUpdate, onSubmit, isBuilder }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    fields.forEach((field) => {
      if (field.type === 'checkbox' && field.options) {
        data[field.id] = field.options.filter((_, i) => formData.get(`${field.id}-${i}`) === 'on');
      } else {
        data[field.id] = formData.get(field.id);
      }
    });
    onSubmit(data); // Pass the form data to the parent component
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <FormField
          key={field.id}
          field={field}
          onRemove={onRemove}
          onUpdate={onUpdate}
          isBuilder={isBuilder}
        />
      ))}
      {!isBuilder && (
        <Button type="primary" htmlType="submit" style={{ marginTop: '16px' }}>
          Submit
        </Button>
      )}
    </form>
  );
}