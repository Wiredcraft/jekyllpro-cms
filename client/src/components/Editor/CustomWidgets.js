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

class customCodeMirror extends React.Component {
  constructor() {
    super()
    this.state = { mode: 'markdown'}
  }
  changeMode (evt) {
    this.setState({mode: evt.target.value})
  }
  render () {
    const {value, required, onChange} = this.props
    const opts = Object.assign(cmOptions, this.state)
    return (
      <div>
        <div style={{textAlign: 'right', marginBottom: '5px'}}>
          <select onChange={::this.changeMode} value={this.state.mode}>
            <option value='markdown'>Markdown</option>
            <option value='htmlmixed'>HTML</option>
          </select>
        </div>
        <Codemirror value={value} required={required} onChange={(code) => onChange(code)} options={opts} />
      </div>
    )
  }
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

export default {
  customSelect,
  customTextarea,
  customCodeMirror,
  JSONCode
}