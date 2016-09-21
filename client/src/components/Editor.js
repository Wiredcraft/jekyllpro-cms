import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ReactDOM from 'react-dom'

import { parseYamlInsideMarkdown, retriveContent, serializeObjtoYaml } from '../helpers/markdown'
import { updateFile, deleteFile, addNewFile, replaceFile } from '../actions/editorActions'
import { fetchBranchSchema } from '../actions/repoActions'
import DeleteIcon from './svg/DeleteIcon'
import customWidgets from './Editor/CustomWidgets'
import { dateToString } from "../helpers/utils"
import Modal from 'react-modal'
import ModalCustomStyle from './Modal'

const defaultSchema = require('../schema')

// TODO: remove linePattern
class Editor extends Component {
  constructor() {
    super()
    this.state = {
      isPostPublished: true,
      isDraft: false,
      filePathInputClass: '',
      formData: {},
      currentSchema: null,
      showDeleteFileModel: false
    }
  }

  componentDidUpdate(prevProps) {
    const { content, targetFile, schema, newFileMode, selectedFolder } = this.props

    const schemaFetched = schema !== prevProps.schema
    const contentFetched = content !== prevProps.content
    const fileChanged = targetFile !== prevProps.targetFile
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
        return (item.data.jekyll.dir === selectedFolder) || (item.data.jekyll.id === selectedFolder)
      })
    // using locally defined schema if no schema found in fetched data
    if (!folderSchema) {
      folderSchema = defaultSchema.find(item => {
        return (item.data.jekyll.dir === selectedFolder) || item.data.jekyll.id === selectedFolder
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
        formData.draft = docConfigObj.draft
        formData.body = retriveContent(content)
      } else {
        formData.body = content
      }
    }
    this.setState({
      formData,
      isPostPublished: (formData.published !== undefined) ? formData.published : true,
      isDraft: (formData.draft !== undefined) ? formData.draft : false
    })
  }

  updateResult(data) {
    const formData = Object.assign({}, data)
    const {
      selectedFolder,
      currentBranch,
      content,
      targetFile,
      newFileMode,
      fetchBranchSchema,
      updateFile,
      deleteFile,
      replaceFile,
      addNewFile
    } = this.props
    const { currentSchema, isPostPublished, isDraft } = this.state
    const filePath = this.refs.filePath.value
    if (!filePath) {
      console.error('no file path specified')
      this.setState({filePathInputClass: 'error'})
      return
    }
    let updatedContent = formData.body
    delete formData.body

    if ((currentSchema.jekyll.id === 'posts') && (isPostPublished === false)) {
      formData.published = false
    } else {
      delete formData.published
    }
    if ((currentSchema.jekyll.id === 'posts') && (isDraft === true)) {
      formData.draft = true
    } else {
      delete formData.draft
    }
    if (selectedFolder === '_schemas') {
      return this.updateSchemasFolder(filePath, updatedContent)
    }
    if (newFileMode) {
      updatedContent = serializeObjtoYaml(formData) + updatedContent
      addNewFile(currentBranch, filePath, updatedContent)
    } else if (filePath !== targetFile) {
      // file path changed
      let oldPath = targetFile
      updatedContent = this.updateFileFrontMatter(content, formData) + updatedContent
      replaceFile(currentBranch, oldPath, filePath, updatedContent)
    } else {
      updatedContent = this.updateFileFrontMatter(content, formData) + updatedContent
      updateFile(currentBranch, filePath, updatedContent)
    }
  }

  updateFileFrontMatter(originalFile, editorFormData) {
    let originalDocHeaderObj = parseYamlInsideMarkdown(originalFile) || {}

    Object.keys(editorFormData).forEach((prop) => {
      originalDocHeaderObj[prop] = editorFormData[prop]
    })
    return serializeObjtoYaml(originalDocHeaderObj)
  }

  updateSchemasFolder(filePath, updatedContent) {
    const {
      currentBranch,
      targetFile,
      newFileMode,
      fetchBranchSchema,
      updateFile,
      replaceFile,
      addNewFile
    } = this.props
    let actionPromise = Promise.resolve()

    if (newFileMode) {
      actionPromise = addNewFile(currentBranch, filePath, updatedContent)
    } else if (filePath !== targetFile) {
      // file path changed
      let oldPath = targetFile
      actionPromise = replaceFile(currentBranch, oldPath, filePath, updatedContent)

    } else {
      actionPromise = updateFile(currentBranch, filePath, updatedContent)
    }
    actionPromise.then( res => {
      fetchBranchSchema(currentBranch)
    })
  }

  handleSaveBtn() {
    let clickEvt = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    })
    ReactDOM.findDOMNode(this.refs.formSubmitBtn).dispatchEvent(clickEvt)
  }

  handleDeleteFile() {
    const { currentBranch, newFileMode, targetFile, deleteFile, fetchBranchSchema } = this.props

    if (newFileMode) {
      return
    }
    deleteFile(currentBranch, targetFile)
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

  handleDraftInput(evt) {
    const { isDraft } = this.state
    this.setState({ isDraft: !isDraft })
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

  closeDeleteFileModel () {
    this.setState({showDeleteFileModel: false})
  }

  render() {
    const { content, newFileMode, editorUpdating, selectedFolder, targetFile } = this.props
    const { filePathInputClass, formData, newFilePath, currentSchema } = this.state
    let currentFileName = newFileMode && selectedFolder
      ? (selectedFolder + '/' + dateToString(new Date()) + '-new-file')
      : targetFile

    return (
      <section id='content' className={editorUpdating ? 'spinning' : ''}>
        { currentSchema && (newFileMode || content) && (
          <div>
            <header className='sidebar'>
              {(currentSchema.jekyll.type === 'posts') && (<div className='field language'>
                <label>Language</label>
                <span className='select'>
                  <select>
                    <option>English</option>
                    <option>Chinese</option>
                  </select>
                </span>
                <small className='description'>See the <a>Chinese version</a>.</small>
              </div>)}

              {(currentSchema.jekyll.id === 'posts') && (<div className='field published'>
                <label className='switch'>
                  <input type='checkbox' id='published' checked={this.state.isPostPublished} onChange={::this.handlePublishInput}/>
                  <div className='slider'></div>
                </label>
                <label htmlFor='published'>Published</label>
              </div>)}
              {(currentSchema.jekyll.id === 'posts') && (<div className='field draft'>
                <label className='switch'>
                  <input type='checkbox' id='draft' checked={this.state.isDraft} onChange={::this.handleDraftInput}/>
                  <div className='slider'></div>
                </label>
                <label htmlFor='draft'>draft</label>
              </div>)}

              <button className='button primary' onClick={::this.handleSaveBtn}>Save</button>
              <DeleteIcon
                onClick={evt => {this.setState({showDeleteFileModel: true})}} />
              <Modal
                style={ModalCustomStyle}
                isOpen={this.state.showDeleteFileModel}
                onRequestClose={::this.closeDeleteFileModel} >
                <header className='header'>
                  <a className='close' id='close-modal' onClick={::this.closeDeleteFileModel}>Close</a>
                  <h2>Are you sure to delete this file?</h2>
                </header>
                <section className='body'>
                  <p>
                    <button className='button primary' onClick={::this.handleDeleteFile}>Yes</button>
                    <button className='button' onClick={::this.closeDeleteFileModel}>Cancel</button>
                  </p>
                </section>
              </Modal>
            </header>
            <div className='body'>
              <div className='field filename'>
                <label>Filename</label>
                <input
                  className={`${filePathInputClass}`}
                  type='text'
                  ref="filePath"
                  value={newFilePath || currentFileName}
                  onChange={::this.handleFilePathInput}
                  placeholder='Filename' />
              </div>
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

function mapStateToProps(state, { params:
  { collectionType, branch, splat: path } }) {
    
  return {
    currentBranch: branch || 'master',
    selectedFolder: state.repo.get('selectedFolder'),
    schema: state.repo.get('schema'),
    content: state.editor.get('content'),
    targetFile: state.editor.get('targetFile'),
    newFileMode: state.editor.get('newFileMode'),
    editorUpdating: state.editor.get('loading')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ updateFile, deleteFile, addNewFile, fetchBranchSchema, replaceFile }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
