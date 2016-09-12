import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ReactDOM from 'react-dom'

import { parseYamlInsideMarkdown, retriveContent, serializeObjtoYaml } from '../helpers/markdown'
import { updateFile, deleteFile, addNewFile } from '../actions/editorActions'
import { fetchBranchSchema } from '../actions/repoActions'
import DeleteIcon from './svg/DeleteIcon'
import customWidgets from './Editor/CustomWidgets'
import { dateToString } from "../helpers/utils"

const defaultSchema = require('../schema')

// TODO: remove linePattern
@connect(mapStateToProps, mapDispatchToProps)
export default class Editor extends Component {
  constructor() {
    super()
    this.state = {
      isPostPublished: true,
      filePathInputClass: '',
      formData: {},
      currentSchema: null
    }
  }

  componentDidMount() {
    // this.updateEditorForm()
    // this.getCurrentSchema()

  }

  componentDidUpdate(prevProps) {
    const { content, fileIndex, schema, newFileMode, selectedFolder } = this.props

    const schemaFetched = schema !== prevProps.schema
    const contentFetched = content !== prevProps.content
    const fileChanged = fileIndex !== prevProps.fileIndex
    const modeChanged = newFileMode !== prevProps.newFileMode
    const folderChanged = selectedFolder !== prevProps.selectedFolder
    if(modeChanged || schemaFetched || contentFetched || fileChanged) {
      this.updateEditorForm()
      // clean previous inputed file path value
      this.setState({newFilePath: null})
    }
    if (schemaFetched || folderChanged) {
      this.getCurrentSchema()
    }
  }

  getCurrentSchema() {
    let { schema, selectedFolder } = this.props

    schema = schema ? schema : []
    selectedFolder = selectedFolder ? selectedFolder : '_posts'

    let folderSchema = schema.find(item => {
        return item.data.jekyll.dir === selectedFolder
      })
    // using locally defined schema if no schema found in fetched data
    if (!folderSchema) {
      folderSchema = defaultSchema.find(item => {
        return item.data.jekyll.dir === selectedFolder
      }) || {}
    }
    return this.setState({currentSchema: folderSchema.data})
  }

  updateEditorForm() {
    const { content } = this.props
    const { currentSchema } = this.state
    if (!content) return

    let formData = {}
    if (typeof content === 'object') {
      // content is json file
      formData.body = JSON.stringify(content, null, 2)
    } else {
      // content is markdown or html
      const docConfigObj = parseYamlInsideMarkdown(content)

      if(docConfigObj) {
        const schemaObj = currentSchema.JSONSchema.properties
        Object.keys(schemaObj).forEach((prop) => {
          formData[prop] = docConfigObj[prop]
        })
        formData.published = docConfigObj.published
      }
      formData.body = retriveContent(content)
    }
    this.setState({
      formData,
      isPostPublished: (formData.published !== undefined) ? formData.published : true
    })
  }

  updateResult(data) {
    const formData = Object.assign({}, data)
    const {
      selectedFolder,
      currentBranch,
      content,
      fileIndex,
      filesMeta,
      newFileMode,
      fetchBranchSchema,
      updateFile,
      addNewFile
    } = this.props
    const { currentSchema, isPostPublished } = this.state
    const filePath = this.refs.filePath.value
    if (!filePath) {
      console.error('no file path specified')
      this.setState({filePathInputClass: 'error'})
      return
    }
    let updatedContent = formData.body
    delete formData.body

    if (currentSchema.jekyll.type === 'collection') {
      formData.published = isPostPublished
    }

    if (newFileMode) {
      let newIndex = filesMeta.length
      if (selectedFolder === '_schemas') {
        return addNewFile(currentBranch, filePath, updatedContent, newIndex)
          .then( res => {
            fetchBranchSchema(currentBranch)
          })
      }
      updatedContent = serializeObjtoYaml(formData) + updatedContent
      addNewFile(currentBranch, filePath, updatedContent, newIndex )
    } else if (selectedFolder === '_schemas') {
      return updateFile(currentBranch, filePath, updatedContent, fileIndex)
        .then( res => {
          fetchBranchSchema(currentBranch)
        })
    } else {
      if (filePath !== filesMeta[fileIndex].path) {
        //TODO 
        // if file path changed, delete the old file first
      }
      let originalDocHeaderObj = parseYamlInsideMarkdown(content) || {}

      Object.keys(formData).forEach((prop) => {
        originalDocHeaderObj[prop] = formData[prop]
      })
      updatedContent = serializeObjtoYaml(originalDocHeaderObj) + updatedContent
      updateFile(currentBranch, filePath, updatedContent, fileIndex)
    }
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
    const { currentBranch, newFileMode, filesMeta, fileIndex, deleteFile, fetchBranchSchema } = this.props

    if (newFileMode) {
      return
    }
    deleteFile(currentBranch, filesMeta[fileIndex].path, fileIndex)
      .then( res => {
        fetchBranchSchema(currentBranch)
      })
  }

  handleFilePathInput(evt) {
    this.setState({newFilePath: evt.target.value})
  }

  handlePublishInput(evt) {
    const { isPostPublished } = this.state
    this.setState({ isPostPublished: !isPostPublished })
  }

  validateSchemaFile(formData, errors) {
    if (this.props.selectedFolder === '_schemas') {
      try {
        JSON.parse(formData.body)
      }
      catch (e) {
        errors.body.addError('Not valid JSON file')
        return errors
      }
    }
    return errors
  }

  render() {
    const { content, newFileMode, filesMeta, fileIndex, editorUpdating, selectedFolder } = this.props
    const { filePathInputClass, formData, newFilePath, currentSchema } = this.state
    let currentFileName = newFileMode && selectedFolder
      ? (selectedFolder + '/' + dateToString(new Date()) + '-new-file')
      : (filesMeta && filesMeta[fileIndex] && filesMeta[fileIndex].path)

    return (
      <section id='content' className={editorUpdating ? 'spinning' : ''}>
        { currentSchema && (newFileMode || content) && (
          <div>
            <header className='sidebar'>
              {(currentSchema.jekyll.type === 'collection') && (<div className='field language'>
                <label>Language</label>
                <span className='select'>
                  <select>
                    <option>English</option>
                    <option>Chinese</option>
                  </select>
                </span>
                <small className='description'>See the <a>Chinese version</a>.</small>
              </div>)}

              <div className='field filename'>
                <label>Filename</label>
                <input
                  className={`${filePathInputClass}`}
                  type='text'
                  ref="filePath"
                  value={newFilePath || currentFileName}
                  onChange={::this.handleFilePathInput}
                  placeholder='Filename' />
                <small className='description'>Filenames impact the generated URL.</small>
              </div>

              {(currentSchema.jekyll.type === 'collection') && (<div className='field published'>
                <label className='switch'>
                  <input type='checkbox' id='published' checked={this.state.isPostPublished} onChange={::this.handlePublishInput}/>
                  <div className='slider'></div>
                </label>
                <label htmlFor='published'>Published</label>
              </div>)}
              {(currentSchema.jekyll.type === 'collection') && (<div className='field draft'>
                <label className='switch'>
                  <input type='checkbox' id='draft'/>
                  <div className='slider'></div>
                </label>
                <label htmlFor='draft'>draft</label>
              </div>)}

              <button className='button primary' onClick={::this.handleSaveBtn}>Save</button>
              <DeleteIcon
                onClick={::this.handleDeleteBtn} />
            </header>
            <div className='body'>
              <Form
                onSubmit={res => this.updateResult(res.formData)}
                schema={currentSchema.JSONSchema}
                uiSchema={currentSchema.uiSchema}
                widgets={customWidgets}
                validate={::this.validateSchemaFile}
                formData={newFileMode ? {} : formData}>
                <button
                  type='submit'
                  ref='formSubmitBtn'
                  style={{'display': 'none'}}>
                  Submit
                </button>
              </Form>
            </div>
          </div>
        )}
      </section>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentBranch: state.repo.get('currentBranch'),
    selectedFolder: state.repo.get('selectedFolder'),
    schema: state.repo.get('schema'),
    filesMeta: state.repo.get('filesMeta'),
    content: state.editor.get('content'),
    fileIndex: state.editor.get('targetFileIndex'),
    newFileMode: state.editor.get('newFileMode'),
    editorUpdating: state.editor.get('loading')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ updateFile, deleteFile, addNewFile, fetchBranchSchema }, dispatch)
}
