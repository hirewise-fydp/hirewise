import React from 'react';
import FormPreview from '../../components/form-builder/FormPreview';

export default function PublicForm({ fields, onSubmit }) {
  return (
    <FormPreview
      fields={fields}
      onSubmit={onSubmit}
      isBuilder={false}
    />
  );
}
