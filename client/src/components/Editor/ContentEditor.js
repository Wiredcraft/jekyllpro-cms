import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import ReactDOM from 'react-dom'

import { parseYamlInsideMarkdown, retriveContent, serializeObjtoYaml } from '../../helpers/markdown'
import DeleteIcon from '../svg/DeleteIcon'
import customWidgets from './CustomWidgets'
import { dateToString, purgeObject, parseFilePathByLang } from "../../helpers/utils"
import Modal from 'react-modal'
import ModalCustomStyle from '../Modal'


export default class ContentEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentFilePath: props.params ? props.params.splat : '',
      isPostPublished: true,
      isDraft: false,
      language: 'cn',
      filePathInputClass: '',
      formData: {},
      currentSchema: null,
      showDeleteFileModel: false
    }
  }

  componentWillMount() {
    const { selectedCollectionFile } = this.props
    if (selectedCollectionFile) {
      this.getCurrentSchema(selectedCollectionFile.collectionType, this.updateEditorForm)
    }
  }

  componentDidUpdate(prevProps) {
    const { params, selectedCollectionFile } = this.props

    const fileChanged = selectedCollectionFile.path !== prevProps.selectedCollectionFile.path
    const newFileMode = (params.splat === 'new') &&
      ((params.splat !== prevProps.params.splat) || (params.collectionType !== prevProps.params.collectionType))

    if (fileChanged) {
      this.setState({ currentFilePath: selectedCollectionFile.path })
      this.getCurrentSchema(selectedCollectionFile.collectionType, this.updateEditorForm)
    }
    if (newFileMode) {
      this.getCurrentSchema(params.collectionType, () => {
        let s = this.state.currentSchema
        this.setState({
          formData: {},
          currentFilePath: (s.jekyll.dir + '/' + dateToString(new Date()) + '-new-file')
        })
      })
    }
  }

  getCurrentSchema(type, callback) {
    let { schemas } = this.props
    schemas = schemas ? schemas : []

    let schema = schemas.find(item => {
        return (item.jekyll.id === type)
      })

    this.setState({currentSchema: schema}, callback)
  }

  updateEditorForm() {
    const { content, path } = this.props.selectedCollectionFile
    const { currentSchema } = this.state
    if (!content) return
    let formData = {}

    // content is markdown or html
    const docConfigObj = parseYamlInsideMarkdown(content)
    // console.log(docConfigObj)
    if(docConfigObj) {
      const schemaObj = currentSchema.JSONSchema.properties
      Object.keys(schemaObj).forEach((prop) => {
        formData[prop] = docConfigObj[prop]
      })
      formData.published = docConfigObj.published
      formData.draft = docConfigObj.draft
      formData.lang = docConfigObj.lang
      formData.body = retriveContent(content)
    } else {
      formData.body = content
    }
    
    this.setState({
      formData,
      isPostPublished: (formData.published !== undefined) ? formData.published : true,
      isDraft: (formData.draft !== undefined) ? formData.draft : false,
      language: formData.lang ? formData.lang : 'cn'
    })
  }

  updateResult(data) {
    const formData = Object.assign({}, data)
    const {
      selectedCollectionFile,
      currentBranch,
      updateFile,
      deleteFile,
      replaceFile,
      addNewFile,
      collectionFileRemoved,
      collectionFileAdded,
      collectionFileUpdated,
      params
    } = this.props
    const { currentSchema, isPostPublished, isDraft, language } = this.state
    const filePath = this.refs.filePath.value
    if (!filePath) {
      console.error('no file path specified')
      this.setState({filePathInputClass: 'error'})
      return
    }
    let updatedContent = formData.body
    delete formData.body

    if (currentSchema.jekyll.type === 'content') {
      formData.lang = language
    }

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
    // delete all undefined property
    purgeObject(formData)

    if (params.splat === 'new') {
      console.log(formData)
      updatedContent = serializeObjtoYaml(formData) + updatedContent
      addNewFile(currentBranch, filePath, updatedContent)
        .then(() => {
          collectionFileAdded({
            path: filePath,
            content: updatedContent,
            collectionType: params.collectionType,
            updatedAt: new Date()
          })
        })
    } else if (filePath !== selectedCollectionFile.path) {
      // file path changed
      let oldPath = selectedCollectionFile.path
      updatedContent = this.updateFileFrontMatter(selectedCollectionFile.content, formData) + updatedContent
      replaceFile(currentBranch, oldPath, filePath, updatedContent)
        .then(() => {
          collectionFileUpdated(oldPath, {
            path: filePath,
            content: updatedContent,
            collectionType: params.collectionType,
            updatedAt: new Date()            
          })
        })
    } else {
      updatedContent = this.updateFileFrontMatter(selectedCollectionFile.content, formData) + updatedContent
      updateFile(currentBranch, filePath, updatedContent)
        .then(() => {
          collectionFileUpdated(filePath, {
            path: filePath,
            content: updatedContent,
            collectionType: params.collectionType,
            updatedAt: new Date()            
          })
        })
    }
  }

  updateFileFrontMatter(originalFile, editorFormData) {
    let originalDocHeaderObj = parseYamlInsideMarkdown(originalFile) || {}

    Object.keys(editorFormData).forEach((prop) => {
      originalDocHeaderObj[prop] = editorFormData[prop]
    })
    return serializeObjtoYaml(originalDocHeaderObj)
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
    const { currentBranch, params, selectedCollectionFile, deleteFile, collectionFileRemoved } = this.props

    if (params.splate === 'new') {
      return this.closeDeleteFileModel()
    }
    this.closeDeleteFileModel()
    deleteFile(currentBranch, selectedCollectionFile.path)
      .then(() => {
        collectionFileRemoved(selectedCollectionFile.path)
      })
  }

  handleFilePathInput(evt) {
    this.setState({ currentFilePath: evt.target.value })
  }

  handlePublishInput(evt) {
    const { isPostPublished } = this.state
    this.setState({ isPostPublished: !isPostPublished })
  }

  handleDraftInput(evt) {
    const { isDraft } = this.state
    this.setState({ isDraft: !isDraft })
  }

  closeDeleteFileModel () {
    this.setState({showDeleteFileModel: false})
  }

  switchFileByLang() {
    // const {language} = this.state
    const { selectCollectionFile, collections, toRoute } = this.props
    const { currentFilePath } = this.state
    // const filePath = this.refs.filePath.value
    const { collectionType, branch } = this.props.params
    console.log(currentFilePath)
    if (!currentFilePath) return
    let translations = parseFilePathByLang(currentFilePath)
    let anotherFilePath = translations['en'] ? translations['en'] : translations['cn']
    let isExistingFile = collections.some((item) =>{
      if (item.path === anotherFilePath) {
        selectCollectionFile(item)
        return true
      }
      return false
    })
    if (isExistingFile) {
      this.updateEditorForm()
      toRoute(`/${collectionType}/${branch}/${anotherFilePath}`)
    } else {
      toRoute(`/${collectionType}/${branch}/new`)

      this.setState({ currentFilePath: anotherFilePath })
    }
  }

  changeLanguage(evt) {
    this.setState({language: evt.target.value})
  }

  render() {
    const { editorUpdating, selectedCollectionFile, params } = this.props
    const { filePathInputClass, formData, currentFilePath, currentSchema } = this.state
    let translations = parseFilePathByLang(currentFilePath)
    console.log(translations)
    if (!currentSchema) return (<section id='content' />)

    return (
      <section id='content'>
        <aside className='sidebar'>
          {(currentSchema.jekyll.type === 'content') && <div className='field language'>
            <label>Language</label>
            <span className='select'>
              <select value={this.state.language || 'cn'} onChange={::this.changeLanguage}>
                <option value='en'>English</option>
                <option value='cn'>Chinese</option>
              </select>
            </span>
            <small className='description'>Translations:&nbsp; 
              <a onClick={::this.switchFileByLang}>{translations['cn'] ? 'Chinese' : 'English'}</a>
            </small>
          </div>}

          <span className="bundle">
            <button className="button primary save" onClick={::this.handleSaveBtn}>Save</button>

            <span className="menu">
              <button className="button primary">
                <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"></path>
                </svg>
              </button>
              <div className="options">
                {
                  (currentSchema.jekyll.id === 'posts') ? [
                    <a className="selected" onClick={::this.handlePublishInput} key='publish'>
                      {this.state.isPostPublished && <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path>
                      </svg>}
                      <span>Published</span>
                    </a>,
                    <a className="selected" onClick={::this.handleDraftInput} key='draft'>
                      {this.state.isDraft && <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path>
                      </svg>}
                      <span>Draft</span>
                    </a>,
                    <hr key='hr' />
                  ]
                  : <span></span>
                }
                <a className="danger" onClick={evt => {this.setState({showDeleteFileModel: true})}}>
                  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path>
                  </svg>
                  Delete
                </a>
              </div>
            </span>
          </span>
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
        </aside>
        <div className='body'>
          <div className='field filename'>
            <label>Filename</label>
            <input
              className={`${filePathInputClass}`}
              type='text'
              ref="filePath"
              value={currentFilePath}
              onChange={::this.handleFilePathInput}
              placeholder='Filename' />
          </div>
          <Form
            onSubmit={res => this.updateResult(res.formData)}
            schema={currentSchema.JSONSchema}
            uiSchema={currentSchema.uiSchema}
            widgets={customWidgets}
            formData={formData}>
            <button
              type='submit'
              ref='formSubmitBtn'
              style={{'display': 'none'}}>
              Submit
            </button>
          </Form>
        </div>
      </section>
    )
  }
}
