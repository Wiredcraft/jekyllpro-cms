import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ReactDOM from 'react-dom'

import { parseYamlInsideMarkdown, retriveContent, serializeObjtoYaml } from '../helpers/markdown'
import { updateFile, deleteFile } from '../actions/editorActions'
import DeleteIcon from './svg/DeleteIcon'
import customWidgets from './Editor/CustomWidgets'

// TODO: remove linePattern
@connect(mapStateToProps, mapDispatchToProps)
export default class Editor extends Component {
  constructor() {
    super()
    this.state = {
      filePathInputClass: '',
      formData: {},
      resultMarkdown: '',
      targetContent: ''
    }
  }

  componentDidMount() {
    this.updateEditFrom()
  }

  componentDidUpdate(prevProps) {
    const { content, fileIndex, schema, newFileMode } = this.props

    const schemaFetched = schema !== prevProps.schema
    const contentFetched = content !== prevProps.content
    const fileChanged = fileIndex !== prevProps.fileIndex
    const modeChanged = newFileMode !== prevProps.newFileMode
    if(modeChanged || schemaFetched || contentFetched || fileChanged) {
      this.updateEditFrom()
    }
  }

  updateEditFrom() {
    const { content, schema } = this.props
    if(!content) return
    const docConfigObj = parseYamlInsideMarkdown(content)
    let formData = {}

    if(docConfigObj) {
      const schemaObj = schema.JSONSchema.properties
      Object.keys(schemaObj).forEach((prop) => {
        formData[prop] = docConfigObj[prop]
      })      
    }

    const targetContent = retriveContent(content)
    formData.body = targetContent
    this.setState({ formData, targetContent })
  }

  updateResult(data) {
    const formData = Object.assign({}, data)
    const { content, fileIndex, filesMeta, schema, updateFile, newFileMode } = this.props
    const filePath = this.refs.filePath.value
    if (!filePath) {
      console.error('no file path specified')
      this.setState({filePathInputClass: 'error'})
      return
    }
    let newIndex = fileIndex
    let markdownHeader = ''
    let markdownText = formData.body
    delete formData.body

    if (newFileMode) {
      newIndex = filesMeta.length
      markdownHeader = serializeObjtoYaml(formData)
      console.log(markdownHeader, markdownText)
    } else {
      let originalDocHeaderObj = parseYamlInsideMarkdown(content) || {}

      Object.keys(formData).forEach((prop) => {
        originalDocHeaderObj[prop] = formData[prop]
      })

      markdownHeader = serializeObjtoYaml(originalDocHeaderObj)

      if (filePath !== filesMeta[fileIndex].path) {
        //TODO 
        // if file path changed, delete the old file first
      }
    }
    updateFile(filePath, markdownHeader + markdownText, newIndex)

  }

  handleSaveBtn() {
    let clickEvt = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    })
    ReactDOM.findDOMNode(this.refs.formSubmitBtn).dispatchEvent(clickEvt)
  }

  handleDeleteBtn() {
    const { newFileMode, filesMeta, fileIndex, deleteFile } = this.props

    if (newFileMode) {
      return
    }
    deleteFile(filesMeta[fileIndex].path, fileIndex)
  }

  render() {
    const { schema, content, newFileMode, filesMeta, fileIndex } = this.props
    const { filePathInputClass, resultMarkdown, formData } = this.state
    let currentFileName = newFileMode
      ? ('_posts/new-file' + Date.now() + '.md')
      : (filesMeta && filesMeta[fileIndex] && filesMeta[fileIndex].path)

    return (
      <section id='content'>
        { schema && (newFileMode || content) && (
          <header className='sidebar'>
            <div className='field language'>
              <label>Language</label>
              <span className='select'>
                <select>
                  <option>English</option>
                  <option>Chinese</option>
                </select>
              </span>
              <small className='description'>See the <a>Chinese version</a>.</small>
            </div>

            <div className='field filename'>
              <label>Filename</label>
              <input
                className={`${filePathInputClass}`}
                type='text'
                ref="filePath"
                defaultValue={currentFileName}
                placeholder='Filename' />
              <small className='description'>Filenames impact the generated URL.</small>
            </div>

            <div className='field published'>
              <label className='switch'>
                <input type='checkbox' id='published' checked/>
                <div className='slider'></div>
              </label>
              <label htmlFor='published'>Published</label>
            </div>

            <div className='field draft'>
              <label className='switch'>
                <input type='checkbox' id='draft'/>
                <div className='slider'></div>
              </label>
              <label htmlFor='draft'>draft</label>
            </div>
            <button className='button primary' onClick={::this.handleSaveBtn}>Save</button>
            <DeleteIcon
              onClick={::this.handleDeleteBtn} />
          </header>
        )}
        { schema && (newFileMode || content) && (
          <div className='body'>
            <Form
              onSubmit={res => this.updateResult(res.formData)}
              schema={schema.JSONSchema}
              uiSchema={schema.uiSchema}
              widgets={customWidgets}
              formData={newFileMode ? {} : formData}>
              <button
                type='submit'
                ref='formSubmitBtn'
                style={{'display': 'none'}}>
                Submit
              </button>
            </Form>
            <div style={{ display: 'none' }}>
              <h3>Result</h3>
              <textarea value={resultMarkdown} />
            </div>
          </div>
        )}
      </section>
    )
  }
}

function mapStateToProps(state) {
  return {
    content: state.editor.get('content'),
    filesMeta: state.repo.get('filesMeta'),
    fileIndex: state.editor.get('targetFileIndex'),
    schema: state.editor.get('schema'),
    newFileMode: state.editor.get('newFileMode')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ updateFile, deleteFile }, dispatch)
}
