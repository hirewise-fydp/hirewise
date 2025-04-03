import React from 'react';
import PublicForm from '../../../components/public-form/PublicForm';
import { useParams } from 'react-router-dom';

export default function PublicFormPage() {
  const { formId } = useParams();
  return <PublicForm formId={formId} />;
}