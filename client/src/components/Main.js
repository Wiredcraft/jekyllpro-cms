import React from 'react'
import Form from 'react-jsonschema-form'

import { defaultMarkdownText, defaultSchemaText } from '../constants/defaultText'
import { SUPPORTED_TYPE } from '../constants/types'
import 'normalize.css/normalize.css'
import 'styles/main.scss'


class AppComponent extends React.Component {
  constructor() {
    super()
    this.state = {
      schemaCanBeParsed: true,
      markdownText: defaultMarkdownText,
      formSchema: { type: 'object', properties: {} },
      previousMarkdownState: '',
      resultMarkdown: ''
    }
  }

  componentDidMount() {
    this.updateEditFrom()
  }

  checkSchema() {
    const { schemaInput } = this.refs
    let schemaCanBeParsed = true
    try {
      const obj = JSON.parse(schemaInput.value)
      schemaCanBeParsed = (typeof obj === 'object') && obj.length > 0
      if(schemaCanBeParsed) {
        for (let i = 0; i < obj.length; i++) {
          if(SUPPORTED_TYPE.every(d => obj[i].type !== d)) {
            schemaCanBeParsed = false
            break
          }
        }
      }
      this.setState({ schemaCanBeParsed })
    } catch (e) {
      schemaCanBeParsed = false
      this.setState({ schemaCanBeParsed: false })
    }
    if(schemaCanBeParsed) this.updateEditFrom()
  }

  updateEditFrom() {
    const { schemaInput } = this.refs
    let { markdownText, schemaCanBeParsed, formSchema } = this.state

    const schemaObj = JSON.parse(schemaInput.value)
    if (!schemaCanBeParsed) return
    formSchema.properties = {}
    for (let i = 0; i < schemaObj.length; i++) {
      if(!schemaObj[i].name) continue
      const linePattern = new RegExp(schemaObj[i].target + ': ?[\\w ]*')
      const line = linePattern.exec(markdownText)
      const prePattern = new RegExp(schemaObj[i].target + ': ?')
      if(!line) continue
      let defaultValue = line[0].replace(prePattern, '')
      if(schemaObj[i].type === 'boolean') {
        defaultValue = defaultValue === 'true'
      }
      formSchema.properties[schemaObj[i].name] = {
        default: defaultValue,
        title: schemaObj[i].name,
        type: schemaObj[i].type
      }
    }
    this.setState({ formSchema })
  }

  updateMarkdown() {
    const { schemaCanBeParsed } = this.state
    const { markdownInput } = this.refs

    this.setState({ markdownText: markdownInput.value })

    if (schemaCanBeParsed) {
      setTimeout(() => this.updateEditFrom(), 20)
    }
  }

  updateResult(formData) {
    const { schemaInput } = this.refs
    let { markdownText, schemaCanBeParsed } = this.state

    const schemaObj = JSON.parse(schemaInput.value)
    let newMarkdownText = markdownText
    if (!schemaCanBeParsed) return
    for (let i = 0; i < schemaObj.length; i++) {
      const linePattern = new RegExp(schemaObj[i].target + ': ?[\\w ]*')
      const line = linePattern.exec(markdownText)
      const prePattern = new RegExp(schemaObj[i].target + ': ?')
      if(!line) continue
      let newValue = formData[schemaObj[i].name]
      const preText = prePattern.exec(markdownText)[0]
      newMarkdownText =
        newMarkdownText.replace(linePattern, preText + newValue)
    }
    this.setState({ resultMarkdown: newMarkdownText, previousMarkdownState: newMarkdownText })
  }

  render() {
    const {
      formSchema,
      markdownText,
      resultMarkdown,
      schemaCanBeParsed
    } = this.state

    return (
      <div>
        <h3>Schema</h3>
        <textarea
          cols='50'
          defaultValue={defaultSchemaText}
          onChange={() => this.checkSchema()}
          ref='schemaInput'
          rows='10'
          className={ schemaCanBeParsed ? '' : 'error' }
        />
        <h3>Original Markdown</h3>
        <textarea
          cols='50'
          defaultValue={markdownText}
          ref='markdownInput'
          rows='10'
          onChange={() => this.updateMarkdown()}
        />
        <h3>Edit From</h3>
        <Form
          onSubmit={res => this.updateResult(res.formData)}
          schema={formSchema}
        />
        <h3>Result</h3>
        <textarea
          cols='50'
          rows='10'
          ref='res'
          value={resultMarkdown}
        />
      </div>
    )
  }
}

export default AppComponent
