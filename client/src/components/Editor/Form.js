import React, { Component } from 'react';
import JSONSchemaForm from 'react-jsonschema-form';
import customWidgets from '../JSONSchemaForm/CustomWidgets';
import CustomArrayField from '../JSONSchemaForm/CustomArrayField';

export default class Form extends Component {
  render() {
    const {
      onFormChange,
      onFormSubmit,
      schema,
      uiSchema,
      formData
    } = this.props;

    return (
      <JSONSchemaForm
        onChange={onFormChange}
        onSubmit={onFormSubmit}
        schema={schema}
        uiSchema={uiSchema}
        fields={{ ArrayField: CustomArrayField }}
        widgets={customWidgets}
        showErrorList={false}
        formData={formData}
      >
        <button type="submit" ref="formSubmitBtn" style={{ display: 'none' }}>
          Submit
        </button>
      </JSONSchemaForm>
    );
  }
}
