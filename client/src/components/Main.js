import React from 'react'
import Form from 'react-jsonschema-form'
import yaml from 'js-yaml'

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
      if(!line) continue

      const prePattern = new RegExp(schemaObj[i].target + ': ?')
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

  parseMarkdownYaml(text) {
    const splitter = '---'
    const targetLines = text.split('\n')
    const indexes = []
    const lineCount = targetLines.length
    for (let i = 0; i < lineCount; i++) {
      if (targetLines[i] === splitter) indexes.push(i)
    }
    if (indexes.length > 1) {
      let text = ''
      for (let i = indexes[0] + 1; i < indexes[1]; i++) {
        text += targetLines[i] + '\n'
      }
      const doc = yaml.load(text)
      console.log(doc);
    }

  }

  updateMarkdown() {
    const { schemaCanBeParsed } = this.state
    const { markdownInput } = this.refs

    this.setState({ markdownText: markdownInput.value })

    this.parseMarkdownYaml(markdownInput.value)
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
      if(!line) continue

      const prePattern = new RegExp(schemaObj[i].target + ': ?')
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
          defaultValue={defaultSchemaText}
          onChange={() => this.checkSchema()}
          ref='schemaInput'
          className={schemaCanBeParsed ? '' : 'error'}
        />
        <h3>Original Markdown</h3>
        <textarea
          defaultValue={markdownText}
          ref='markdownInput'
          onChange={() => this.updateMarkdown()}
        />
        <h3>Edit From</h3>
        <Form
          onSubmit={res => this.updateResult(res.formData)}
          schema={formSchema}
        />
        <h3>Result</h3>
        <textarea value={resultMarkdown} />
      </div>
    )
  }
}

export default AppComponent
