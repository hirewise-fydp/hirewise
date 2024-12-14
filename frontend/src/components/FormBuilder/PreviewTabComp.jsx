import React from 'react';
import { Form, Input, Select, Radio } from 'antd';

const { Option } = Select;

const PreviewFormTab = ({ fields }) => {
  return (
    <Form layout="vertical" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Form Preview</h2>
      {fields.map((field) => (
        <Form.Item
          key={field.id}
          label={field.label}
          style={{ marginBottom: '20px' }}
        >
          {/* Render based on field type */}
          {field.type === 'text' && (
            <Input placeholder={`Enter ${field.label}`} disabled />
          )}
          {field.type === 'email' && (
            <Input placeholder={`Enter your email`} type="email" disabled />
          )}
          {field.type === 'select' && (
            <Select disabled>
              {field.options?.map((option, index) => (
                <Option key={index} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          )}
          {field.type === 'radio' && (
            <Radio.Group disabled>
              {field.options?.map((option, index) => (
                <Radio key={index} value={option}>
                  {option}
                </Radio>
              ))}
            </Radio.Group>
          )}
        </Form.Item>
      ))}
    </Form>
  );
};

export default PreviewFormTab;
