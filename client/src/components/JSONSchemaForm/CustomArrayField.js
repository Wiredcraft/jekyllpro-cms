import React, { Component } from 'react'
import ArrayField from 'react-jsonschema-form/lib/components/fields/ArrayField'
import { getDefaultFormState } from 'react-jsonschema-form/lib/utils'
import Tags from './Tags'

export default class CustomArrayField extends Component {
  constructor(props) {
    super(props)
    this.state = this.getStateFromProps(props)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateFromProps(nextProps))
  }
  
  getStateFromProps(props) {
    const formData = Array.isArray(props.formData) ? props.formData : null
    const {definitions} = this.props.registry
    return {
      items: getDefaultFormState(props.schema, formData, definitions) || []
    }
  }
  
  render() {
    const { formData, schema, idSchema, required, registry: { fields, definitions } } = this.props
    const title = (schema.title === undefined) ? name : schema.title

    if (schema.items.type === 'string') {
      return (
        <fieldset className='field field-array field-array-of-string'>
          <fields.TitleField
            idSchema={idSchema}
            title={title}
            required={required} />
          <Tags value={this.state.items} {...this.props} />
        </fieldset>
      )
    }
    return <ArrayField {...this.props} />
  }
}

