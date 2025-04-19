import React from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Checkbox,
  DatePicker,
  Switch,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const FormField = ({ field, onRemove, onUpdate, isBuilder }) => {
  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return <Input name={field.id} placeholder={field.placeholder} disabled={isBuilder} />;
      case 'email':
        return <Input name={field.id} type="email" placeholder={field.placeholder} disabled={isBuilder} />;
      case 'number':
        return <Input name={field.id} type="number" placeholder={field.placeholder} disabled={isBuilder} />;
      case 'textarea':
        return <TextArea name={field.id} placeholder={field.placeholder} disabled={isBuilder} />;
      case 'select':
        return (
          <Select name={field.id} placeholder={field.placeholder} style={{ width: '100%' }} disabled={isBuilder}>
            {field.options?.map((option, index) => (
              <Option key={index} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        );
      case 'checkbox':
        return (
          <Checkbox.Group name={field.id} disabled={isBuilder}>
            {field.options?.map((option, index) => (
              <Checkbox key={index} value={option}>
                {option}
              </Checkbox>
            ))}
          </Checkbox.Group>
        );
      case 'date':
        return <DatePicker name={field.id} style={{ width: '100%' }} disabled={isBuilder} />;
      case 'file':
        return <Input name={field.id} type="file" accept={field.accept} disabled={isBuilder} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{field.label}</span>
            {field.required && (
              <span style={{ color: "red", marginLeft: "4px" }}>*</span>
            )}
          </div>
          {isBuilder && field.editable && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Switch
                checked={field.required}
                onChange={(checked) =>
                  onUpdate(field.id, { required: checked })
                }
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

export default function FormPreview({
  fields,
  onRemove,
  onUpdate,
  onSubmit,
  isBuilder,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    fields.forEach((field) => {
      if (field.type === "checkbox") {
        data[field.id] = formData.getAll(field.id); // Capture array of selected values
      } else if (field.type === "file") {
        data[field.id] = e.target.elements[field.id].files[0] || null; // Capture file object
      } else {
        data[field.id] = formData.get(field.id); // Capture single value
      }
    });
    console.log("Form data:", data); // Debug log
    onSubmit(data);
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
        <Button type="primary" htmlType="submit" style={{ marginTop: "16px" }}>
          Submit
        </Button>
      )}
    </form>
  );
}