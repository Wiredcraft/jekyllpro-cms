import React from 'react'
import SelectWidget from 'react-jsonschema-form/lib/components/widgets/SelectWidget'
import TextareaWidget from 'react-jsonschema-form/lib/components/widgets/TextareaWidget'
import Codemirror from 'react-codemirror'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/addon/display/autorefresh'
import "codemirror/lib/codemirror.css"
import Tags from './Tags'
const cmOptions = {
  theme: "default",
  height: "auto",
  viewportMargin: Infinity,
  mode: 'markdown',
  lineNumbers: false,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2
}

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
    <TextareaWidget {...newProps} />
  )
}

const customCodeMirror = (props) => {
  return (
    <Codemirror value={props.value || ''} required={props.required} onChange={(code) => props.onChange(code)} options={cmOptions} />
  )
}

const JSONCode = (props) => {
  var opts = Object.assign(cmOptions, { mode: {
    name: 'javascript',
    json: true,
    statementIndent: 2
  }})
  return (
    <Codemirror value={props.value} required={props.required} onChange={(code) => props.onChange(code)} options={opts} />
  )
}

const customCheckbox = (props) => {
  const { id, value, required, disabled, label, autofocus, onChange } = props

  return (
    <div className={`checkbox ${disabled ? "disabled" : ""}`}>
      <label for={id}>{label}</label>
      <label className='switch'>
        <input type='checkbox'
          id={id}
          checked={typeof value === "undefined" ? false : value}
          required={required}
          disabled={disabled}
          autoFocus={autofocus || false}
          onChange={(event) => onChange(event.target.checked)}/>
        <div className='slider' />
      </label>
    </div>
  )
}

export default {
  SelectWidget: customSelect,
  CheckboxWidget: customCheckbox,
  customSelect,
  customTextarea,
  customCodeMirror,
  JSONCode,
  Tags
}
