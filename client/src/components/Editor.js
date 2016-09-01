import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { parseYamlInsideMarkdown, retriveContent } from '../helpers/markdown'
import { updateFile } from '../actions/editorActions'


// TODO: remove linePattern
@connect(mapStateToProps, mapDispatchToProps)
export default class Editor extends Component {
  constructor() {
    super()
    this.state = {
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

  updateResult(formData) {
    const { content, fileIndex, filesMeta, schema, updateFile } = this.props
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

    updateFile(filesMeta[fileIndex].path, markdownText + targetContent)
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
        <div style={{ display: 'none' }}>
          <h3>Result</h3>
          <textarea value={resultMarkdown} />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    content: state.editor.get('content'),
    filesMeta: state.repo.get('filesMeta'),
    fileIndex: state.editor.get('targetFileIndex'),
    schema: state.editor.get('schema')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ updateFile }, dispatch)
}
