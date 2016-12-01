import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import ReactDOM from 'react-dom'
import moment from 'moment'
import Cookie from 'js-cookie'

import { parseYamlInsideMarkdown, retriveContent, serializeObjtoYaml } from '../../helpers/markdown'
import DeleteIcon from '../svg/DeleteIcon'
import customWidgets from './CustomWidgets'
import { dateToString, purgeObject, parseFilePathByLang, textValueIsDifferent, parseFilePath } from "../../helpers/utils"
import ConfirmDeletionModal from '../Modal/ConfirmDeletionModal'
import notify from '../common/Notify'

const repoUrl = `https://github.com/${Cookie.get('repoOwner')}/${Cookie.get('repoName')}/`
// const LANGUAGES = [{name: 'Chinese', code: 'cn'}, {name: 'English', code: 'en'}]

export default class ContentEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentFilePath: props.params ? props.params.splat : '',
      currentFileSlug: undefined,
      currentFileExt: undefined,
      currentFileLanguage: undefined,
      currentFileSubFolder: undefined,
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
    const { selectedCollectionFile, params, config } = this.props
    if (selectedCollectionFile) {
      return this.getCurrentSchema(selectedCollectionFile.collectionType, this.updateEditorForm)
    }
    if (params.splat === 'new') {
      this.getCurrentSchema(params.collectionType, () => {
        this.setState({
          formData: {},
          currentFileSlug: dateToString(new Date()) + '-new-file',
          currentFileExt: 'md',
          currentFileLanguage: config && config.languages && config.languages[0].code || undefined,
          currentFileSubFolder: undefined
        }, () => {
          this.updateCurrentFilePath()
        })
      })
    }
  }

  componentDidUpdate(prevProps) {
    const { params, selectedCollectionFile, location, config } = this.props

    const fileChanged = selectedCollectionFile &&
      (selectedCollectionFile.path !== (prevProps.selectedCollectionFile && prevProps.selectedCollectionFile.path))
    const newFileMode = (params.splat === 'new') &&
      ((params.splat !== prevProps.params.splat) || (params.collectionType !== prevProps.params.collectionType))

    if (fileChanged) {
      this.setState({ currentFilePath: selectedCollectionFile.path })
      this.getCurrentSchema(selectedCollectionFile.collectionType, this.updateEditorForm)
    }

    if (newFileMode) {
      this.getCurrentSchema(params.collectionType, () => {
        this.setState({
          formData: {},
          currentFileSlug: dateToString(new Date()) + '-new-file',
          currentFileExt: 'md',
          currentFileLanguage: config && config.languages && config.languages[0].code || undefined,
          currentFileSubFolder: undefined
        }, () => {
          this.updateCurrentFilePath()
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

  setParsedFileProps(fullFilePath) {
    const { config } = this.props
    const { currentSchema } = this.state
    let rootFolder = currentSchema.jekyll.id === 'pages' ? '/' : currentSchema.jekyll.dir
    let langs = config && config.languages || undefined
    let parsedObj = parseFilePath(fullFilePath, langs, rootFolder)
    // console.log(parsedObj)
    this.setState({
      currentFileSlug: parsedObj.fileSlug,
      currentFileExt: parsedObj.fileExt,
      currentFileLanguage: parsedObj.lang,
      currentFileSubFolder: parsedObj.subFolder  
    })
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
      // formData.lang = docConfigObj.lang
      formData.body = retriveContent(content)
    } else {
      formData.body = content
    }
    
    this.setState({
      formData,
      isPostPublished: (formData.published !== undefined) ? formData.published : true,
      isDraft: (formData.draft !== undefined) ? formData.draft : false,
      // language: formData.lang ? formData.lang : 'cn'
    }, () => {
      this.setParsedFileProps(path)
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
    const filePath = this.state.currentFilePath

    let reqPromise = null

    if (!this.state.currentFileSlug) {
      console.error('no file name specified')
      this.setState({filePathInputClass: 'error'})
      return
    }
    let updatedContent = formData.body
    delete formData.body

    // if (currentSchema.jekyll.type === 'content') {
    //   formData.lang = language
    // }

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

  handleFileSlugInput(evt) {
    this.setState({ currentFileSlug: evt.target.value }, () => {
      this.updateCurrentFilePath()
    })
  }

  changeFileLanguage(evt) {
    this.setState({currentFileLanguage: evt.target.value}, () => {
      this.updateCurrentFilePath()
    })
  }

  changeFileType(evt) {
    this.setState({currentFileExt: evt.target.value}, () => {
      this.updateCurrentFilePath()
    })
  }

  handleFileSubFolderInput(evt) {
    this.setState({currentFileSubFolder: evt.target.value}, () => {
      this.updateCurrentFilePath()
    })
  }

  updateCurrentFilePath () {
    const { config } = this.props
    const { currentFileSlug, currentFileExt, currentFileLanguage, currentFileSubFolder, currentSchema } = this.state
    let newPathArray = []
    let newFilename = currentFileExt ? (currentFileSlug + '.' + currentFileExt) : currentFileSlug
    if (currentSchema.jekyll.id !== 'pages') {
      newPathArray.push(currentSchema.jekyll.dir)
    }
    if (currentFileSubFolder) {
      newPathArray.push(currentFileSubFolder)
    }
    if (config && config.languages && currentFileLanguage !== config.languages[0].code) {
      newPathArray.push(currentFileLanguage)
    }
    newPathArray.push(newFilename)
    this.setState({ currentFilePath: newPathArray.join('/')})
  }

  afterOpenModal() {
    document.body.classList.add('ReactModal__Body--open')
  }

  render() {
    const { editorUpdating, selectedCollectionFile, params, schemas, config } = this.props
    const { filePathInputClass, formData, currentFilePath, currentSchema, disableActionBtn, currentFileSlug } = this.state

    if (!currentSchema) return (<section id='content'><div className='empty'>Please select an entry</div></section>)

    return (
      <section id='content'>
        <aside className='sidebar'>
          {params.splat !== 'new' && <div className="field">
            <span className="label">Latest update</span>
            <div className="message">
              <a href={`${repoUrl}commit/${selectedCollectionFile.lastCommitSha}`} target='_blank'>
                {selectedCollectionFile.lastUpdatedBy},&nbsp;{moment(Date.parse(selectedCollectionFile.lastUpdatedAt)).fromNow()}
              </a>
            </div>
          </div>}

          <span className={disableActionBtn ? 'bundle disabled' : 'bundle'}>
            <button className={disableActionBtn ? 'button primary save processing' : 'button primary save'} onClick={::this.handleSaveBtn}>Save</button>

            <span className="menu">
              <button className="button primary">
                <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z"></path>
                  <path d="M0 0h24v24H0z" fill="none"></path>
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
          <div className='field filename field-group'>
            <label>Compile file path</label>
            {currentSchema && (currentSchema.jekyll.id === 'pages') &&
              <input
                type='text'
                value={this.state.currentFileSubFolder}
                onChange={::this.handleFileSubFolderInput}
                placeholder='File folder' />
            }         
            {config && config.languages &&
              <span className='select'>
                <select value={this.state.currentFileLanguage} onChange={::this.changeFileLanguage}>
                  {
                    config.languages.map((lang) => {
                      return <option value={lang.code} key={lang.code}>{lang.name}</option>
                    })
                  }
                </select>
              </span>
            }
            <input
              className={`${filePathInputClass}`}
              type='text'
              value={currentFileSlug}
              onChange={::this.handleFileSlugInput}
              placeholder='File slug' />
            <span className='select'>
              <select value={this.state.currentFileExt} onChange={::this.changeFileType}>
                <option value='md'>markdown</option>
                <option value='html'>html</option>
              </select>
            </span>
          </div>
          <div className='field'>
            <label>Full file path</label>
            <div className='readonly'>{currentFilePath}</div>
          </div>
          <Form
            onChange={res => this.setState({ formData: res.formData })}
            onSubmit={res => this.updateResult(res.formData)}
            schema={currentSchema.JSONSchema}
            uiSchema={currentSchema.uiSchema}
            widgets={customWidgets}
            showErrorList={false}
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
