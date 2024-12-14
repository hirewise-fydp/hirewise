import React, { useState } from 'react';
import { Tabs } from 'antd';
import FormElement from './FormElement';
import '../../styles/FormPreview.css'
import PreviewFormTab from './PreviewTabComp';

const { TabPane } = Tabs;

const FormPreview = ({ fields, deleteField, updateField }) => {
  const [activeTab, setActiveTab] = useState('edit');

  return (
    <div>
      <Tabs
        animated={{ inkBar: true, tabPane: false }}
        centered
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <TabPane tab="Edit" key="edit">
          <div className="form-preview">
            <h3>Edit Form</h3>
            {fields?.map((field) => (
              <FormElement
                key={field.id}
                field={field}
                onDelete={deleteField}
                onUpdate={updateField}
              />
            ))}
          </div>
        </TabPane>
        <TabPane tab="Preview" key="preview">
          <div className="form-preview">
            <h3>Preview</h3>
            <PreviewFormTab fields={fields}/>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default FormPreview;
