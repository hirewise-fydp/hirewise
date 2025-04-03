import React, { useState } from 'react';
import { Card, Button, Modal, Input, Switch, Select } from 'antd';
import { FontSizeOutlined, AlignLeftOutlined, MailOutlined, DownOutlined, NumberOutlined , CheckSquareOutlined, CalendarOutlined, FileOutlined } from "@ant-design/icons";
import { icons } from 'antd/es/image/PreviewGroup';


const { Option } = Select;

export default function FieldPalette({ onAddField }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fieldType, setFieldType] = useState('text');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState(''); // For dropdown and checkbox options

  const fieldTypes = [
    { id: 'text', label: 'Text Input', icon: <FontSizeOutlined/> },
    { id: 'email', label: 'Email Input',icon: <MailOutlined/>  },
    { id: 'number', label: 'Number Input', icon: <NumberOutlined /> },
    { id: 'textarea', label: 'Text Area', icon: <AlignLeftOutlined/> },
    { id: 'select', label: 'Dropdown' , icon: <DownOutlined/>},
    { id: 'checkbox', label: 'Checkbox' , icon: <CheckSquareOutlined/>},
    { id: 'date', label: 'Date Picker' , icon: <CalendarOutlined/>},
    { id: 'file', label: 'File Upload' , icon: <FileOutlined/>},
  ];

  const showModal = (type) => {
    setFieldType(type);
    setIsModalVisible(true);
  };

  const handleAddField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      label: fieldLabel,
      placeholder: fieldPlaceholder,
      required: fieldRequired,
      editable: true,
    };

    // Add options for dropdown and checkbox fields
    if (['select', 'checkbox'].includes(fieldType) && fieldOptions) {
      newField.options = fieldOptions.split(',').map((option) => option.trim());
    }

    onAddField(newField);
    setIsModalVisible(false);
  };

  return (
    <>
      <Card title="Field Palette">
        {fieldTypes.map((type) => (
          <Button
            key={type.id}
            icon={type.icon}
            onClick={() => showModal(type.id)}
            style={{ marginBottom: '8px', width: '100%' }}
          >
            {type.label}
          </Button>
        ))}
      </Card>

      <Modal
        title={`Add ${fieldTypes.find((t) => t.id === fieldType)?.label}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddField}
      >
        <Input
          placeholder="Field Label"
          value={fieldLabel}
          onChange={(e) => setFieldLabel(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <Input
          placeholder="Placeholder Text"
          value={fieldPlaceholder}
          onChange={(e) => setFieldPlaceholder(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        {/* Show options input for dropdown and checkbox fields */}
        {['select', 'checkbox'].includes(fieldType) && (
          <Input
            placeholder="Options (comma separated)"
            value={fieldOptions}
            onChange={(e) => setFieldOptions(e.target.value)}
            style={{ marginBottom: '16px' }}
          />
        )}
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <Switch
          checked={fieldRequired}
          onChange={(checked) => setFieldRequired(checked)}
          style={{ marginBottom: '16px' }}
        />
        <p>Required Field</p>
        </div>

      </Modal>
    </>
  );
}