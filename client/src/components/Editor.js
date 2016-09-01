import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import { connect } from 'react-redux'

import { parseYamlInsideMarkdown, retriveContent } from '../helpers/markdown'
import { defaultMarkdownText, defaultSchemaText } from '../constants/defaultText'
import { SUPPORTED_TYPE } from '../constants/types'


// TODO: remove linePattern
@connect(mapStateToProps)
export default class Editor extends Component {
  constructor() {
    super()
    this.state = {
      schemaCanBeParsed: true,
      markdownText: defaultMarkdownText,
      formSchema: { type: 'object', properties: {} },
      resultMarkdown: '',
      targetContent: ''
    }
  }

  componentDidMount() {
    this.updateEditFrom()
  }

  componentDidUpdate(prevProps) {
    const { content, fileIndex, schema } = this.props

    const schemaFetched = schema && !prevProps.schema
    const contentFetched = content && !prevProps.content
    const fileChanged = fileIndex !== prevProps.fileIndex
    if(schemaFetched || contentFetched || fileChanged) {
      this.updateEditFrom()
    }
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
    } catch (e) {
      schemaCanBeParsed = false
    }
    this.setState({ schemaCanBeParsed })
    if(schemaCanBeParsed) this.updateEditFrom()
  }

  updateEditFrom() {
    const { content, schema } = this.props
    if(!schema || !content) return
    let { formSchema } = this.state
    const docConfigObj = parseYamlInsideMarkdown(content)
    if(!docConfigObj) return

    const schemaObj = schema.properties
    formSchema.properties = {}
    for (let i = 0; i < schemaObj.length; i++) {
      if(!schemaObj[i].name) continue
      const defaultValue = docConfigObj[schemaObj[i].target]
      formSchema.properties[schemaObj[i].name] = {
        default: defaultValue,
        title: schemaObj[i].name,
        type: schemaObj[i].type
      }
    }
    const targetContent = retriveContent(content)
    this.setState({ formSchema, targetContent })
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
    const { content, schema } = this.props
    let markdownText = content
    const docConfigObj = parseYamlInsideMarkdown(markdownText)
    if(!docConfigObj) return

    const schemaObj = schema.properties
    for (let i = 0; i < schemaObj.length; i++) {
      const linePattern = new RegExp(schemaObj[i].target + ': ?[\\w 、\/]*')

      const prePattern = new RegExp(schemaObj[i].target + ': ?')
      let newValue = formData[schemaObj[i].name]
      const preText = prePattern.exec(markdownText)[0]
      markdownText = markdownText.replace(linePattern, preText + newValue)
    }
    const targetContent = retriveContent(markdownText)
    this.setState({ resultMarkdown: markdownText, targetContent })
  }

  render() {
    const { schema, content } = this.props
    const { formSchema, resultMarkdown } = this.state
    return (
      <div id='content'>
        { schema && content && (
          <Form
            onSubmit={res => this.updateResult(res.formData)}
            schema={formSchema}
            uiSchema={schema && schema.uiSchema}
          />
        )}
        <h3>Result</h3>
        <textarea value={resultMarkdown} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    content: state.editor.get('content'),
    fileIndex: state.editor.get('targetFileIndex'),
    schema: state.editor.get('schema')
  }
}
