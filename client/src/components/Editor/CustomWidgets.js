import React from 'react'
import SelectWidget from 'react-jsonschema-form/lib/components/widgets/SelectWidget'
import TextareaWidget from 'react-jsonschema-form/lib/components/widgets/TextareaWidget'

const customSelect= (props) => {
  return (
    <span className='select'>
      <SelectWidget {...props} />
    </span>
  )
}

const customTextarea = (props) => {
  let newProps = Object.assign({rows: '20'}, props)
  return (
    <div>
      <TextareaWidget {...newProps} />
      <small className='description'>The format of this field depends on the extension of the filename (HTML if .html and markdown if .md).</small>
    </div>
  )
}

export default {
  customSelect,
  customTextarea
}