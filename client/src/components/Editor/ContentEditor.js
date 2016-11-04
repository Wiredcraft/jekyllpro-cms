import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import ReactDOM from 'react-dom'
import moment from 'moment'
import Cookie from 'js-cookie'

import { parseYamlInsideMarkdown, retriveContent, serializeObjtoYaml } from '../../helpers/markdown'
import DeleteIcon from '../svg/DeleteIcon'
import customWidgets from './CustomWidgets'
import { dateToString, purgeObject, parseFilePathByLang, textValueIsDifferent } from "../../helpers/utils"
import ConfirmDeletionModal from '../Modal/ConfirmDeletionModal'
import notify from '../common/Notify'

const repoUrl = `https://github.com/${Cookie.get('repoOwner')}/${Cookie.get('repoName')}/`

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
      showDeleteFileModel: false,
      disableActionBtn: false
    }
  }

  componentWillMount() {
    const { selectedCollectionFile } = this.props
    if (selectedCollectionFile) {
      this.getCurrentSchema(selectedCollectionFile.collectionType, this.updateEditorForm)
    }
  }

  componentDidUpdate(prevProps) {
    const { params, selectedCollectionFile, location } = this.props

    const fileChanged = selectedCollectionFile.path !== (prevProps.selectedCollectionFile && prevProps.selectedCollectionFile.path)
    const newFileMode = (params.splat === 'new') &&
      ((params.splat !== prevProps.params.splat) || (params.collectionType !== prevProps.params.collectionType))

    if (fileChanged) {
      this.setState({ currentFilePath: selectedCollectionFile.path })
      this.getCurrentSchema(selectedCollectionFile.collectionType, this.updateEditorForm)
    }
    if (newFileMode) {
      this.getCurrentSchema(params.collectionType, () => {
        let s = this.state.currentSchema
        if (location.query.translation) {
          return
        }
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
      selectCollectionFile,
      currentBranch,
      updateFile,
      deleteFile,
      replaceFile,
      addNewFile,
      collectionFileRemoved,
      collectionFileAdded,
      collectionFileUpdated,
      toRoute,
      params: { repoOwner, repoName, collectionType, branch, splat }
    } = this.props
    const { currentSchema, isPostPublished, isDraft, language } = this.state
    const filePath = this.refs.filePath.value
    let reqPromise = null

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

    if (isPostPublished === false) {
      formData.published = false
    } else {
      delete formData.published
    }
    if (isDraft === true) {
      formData.draft = true
    } else {
      delete formData.draft
    }
    // delete all undefined property
    purgeObject(formData)

    this.setState({ disableActionBtn: true, formData: data })

    if (splat === 'new') {
      updatedContent = serializeObjtoYaml(formData) + updatedContent
      reqPromise = addNewFile(currentBranch, filePath, updatedContent)
        .then((data) => {
          let newItem = {
            path: filePath,
            content: updatedContent,
            collectionType: collectionType,
            lastUpdatedAt: data.commit.committer.date,
            lastUpdatedBy: data.commit.committer.name,
            lastCommitSha: data.commit.sha 
          }
          collectionFileAdded(newItem)
          selectCollectionFile(newItem)
          toRoute(`/${repoOwner}/${repoName}/${collectionType}/${branch}/${filePath}`)
          this.setState({ disableActionBtn: false })
        })
    } else if (filePath !== selectedCollectionFile.path) {
      // file path changed
      let oldPath = selectedCollectionFile.path
      updatedContent = this.updateFileFrontMatter(selectedCollectionFile.content, formData) + updatedContent

      reqPromise = replaceFile(currentBranch, oldPath, filePath, updatedContent)
        .then((data) => {
          let newItem = {
            path: filePath,
            content: updatedContent,
            collectionType: collectionType,
            lastUpdatedAt: data.commit.committer.date,
            lastUpdatedBy: data.commit.committer.name,
            lastCommitSha: data.commit.sha           
          }
          collectionFileUpdated(oldPath, newItem)
          selectCollectionFile(newItem)
          toRoute(`/${repoOwner}/${repoName}/${collectionType}/${branch}/${filePath}`)
          this.setState({ disableActionBtn: false })
        })
    } else {
      updatedContent = this.updateFileFrontMatter(selectedCollectionFile.content, formData) + updatedContent

      if (!textValueIsDifferent(selectedCollectionFile.content, updatedContent)) {
        this.setState({ disableActionBtn: false })
        return notify('warning', 'You don\'t have any changes!')
      }
      reqPromise = updateFile(currentBranch, filePath, updatedContent)
        .then((data) => {
          let newItem = {
            path: filePath,
            content: updatedContent,
            collectionType: collectionType,
            lastUpdatedAt: data.commit.committer.date,
            lastUpdatedBy: data.commit.committer.name,
            lastCommitSha: data.commit.sha
          }
          collectionFileUpdated(filePath, newItem)
          selectCollectionFile(newItem)
          this.setState({ disableActionBtn: false })
        })
    }

    reqPromise.then(() => {
      notify('success', 'Change saved!')
    })
    .catch(err => {
      this.setState({ disableActionBtn: false })
      notify('error', 'Unable to complete the operation!')
    })
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
    const { currentBranch, selectedCollectionFile, deleteFile,
      collectionFileRemoved, toRoute, params: { repoOwner, repoName, splat } } = this.props

    if (splat === 'new') {
      return this.closeDeleteFileModel()
    }
    this.closeDeleteFileModel()
    this.setState({ disableActionBtn: true })
    deleteFile(currentBranch, selectedCollectionFile.path)
      .then(() => {
        collectionFileRemoved(selectedCollectionFile.path)
        toRoute(`/${repoOwner}/${repoName}`)
        notify('success', 'File deleted!')
      })
      .catch(err => {
        this.setState({ disableActionBtn: false })
        notify('error', 'Unable to complete the operation!')
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
    const { selectCollectionFile, collections, toRoute } = this.props
    const { currentFilePath } = this.state
    const { repoOwner, repoName, collectionType, branch } = this.props.params

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
      toRoute(`/${repoOwner}/${repoName}/${collectionType}/${branch}/${anotherFilePath}`)
    } else {
      toRoute(`/${repoOwner}/${repoName}/${collectionType}/${branch}/new?translation=true`)

      this.setState({ currentFilePath: anotherFilePath, formData: {} })
    }
  }

  changeLanguage(evt) {
    this.setState({language: evt.target.value})
  }

  render() {
    const { editorUpdating, selectedCollectionFile, params, schemas } = this.props
    const { filePathInputClass, formData, currentFilePath, currentSchema, disableActionBtn } = this.state
    let translations = parseFilePathByLang(currentFilePath)

    if (!currentSchema) return (<section id='content'><div className='empty'>Please select an entry</div></section>)

    return (
      <section id='content'>
        <aside className='sidebar'>
          {params.splat !== 'new' && <div className="field">
            <span className="label">Latest update</span>
            <div className="message">
              <a>{selectedCollectionFile.lastUpdatedBy}</a>
              ,&nbsp;{moment(Date.parse(selectedCollectionFile.lastUpdatedAt)).fromNow()}
              &nbsp;(<a href={`${repoUrl}commit/${selectedCollectionFile.lastCommitSha}`} target='_blank'> #{selectedCollectionFile.lastCommitSha.slice(0, 6)} </a>)
            </div>
          </div>}
          <div className='field language'>
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
          </div>

          <span className={disableActionBtn ? 'bundle loading' : 'bundle'}>
            <button className="button primary save" onClick={::this.handleSaveBtn}>Save</button>

            <span className="menu">
              <button className="button primary">
                <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"></path>
                </svg>
              </button>
              <div className="options">
                <a className={this.state.isPostPublished ? 'selected' : 'disabled'} onClick={::this.handlePublishInput}>
                  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path>
                  </svg>
                  <span>Published</span>
                </a>
                <a className={this.state.isDraft ? 'selected' : 'disabled'} onClick={::this.handleDraftInput}>
                  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path>
                  </svg>
                  <span>Draft</span>
                </a>
                <hr />
                <a className="danger" onClick={evt => {this.setState({showDeleteFileModel: true})}}>
                  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path>
                  </svg>
                  Delete
                </a>
              </div>
            </span>
          </span>
          <ConfirmDeletionModal
            isOpen={this.state.showDeleteFileModel}
            onclose={::this.closeDeleteFileModel}
            onsubmit={::this.handleDeleteFile}
            oncancel={::this.closeDeleteFileModel} />
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
