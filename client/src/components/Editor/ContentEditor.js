import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import ReactDOM from 'react-dom'
import moment from 'moment'
import Cookie from 'js-cookie'

import { parseYamlInsideMarkdown, retriveContent, serializeObjtoYaml } from '../../helpers/markdown'
import TrashIcon from '../svg/TrashIcon'
import MoreMenuIcon from '../svg/MoreMenuIcon'
import CheckIcon from '../svg/CheckIcon'
import BackArrowIcon from '../svg/BackArrowIcon'
import CaretDownIcon from '../svg/CaretDownIcon'
import customWidgets from '../JSONSchemaForm/CustomWidgets'
import CustomArrayField from '../JSONSchemaForm/CustomArrayField'
import { dateToString, purgeObject, textValueIsDifferent, parseFilePath } from "../../helpers/utils"
import ConfirmDeletionModal from '../Modal/ConfirmDeletionModal'
import notify from '../common/Notify'


const repoUrl = `https://github.com/${Cookie.get('repoOwner')}/${Cookie.get('repoName')}/`

const fileExtMapping = (ext) => {
  switch (ext) {
    case 'md':
      return 'Markdown'
    case 'html':
      return 'HTML'
    default:
      return ext
  }
}

export default class ContentEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentFilePath: props.params ? props.params.splat : '',
      currentFileSlug: undefined,
      currentFileExt: undefined,
      currentFileLanguage: undefined,
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
          currentFileLanguage: config && config.languages && config.languages[0].code || undefined
        }, () => {
          this.updateCurrentFilePath()
        })
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedCollectionFile } = nextProps

    if (selectedCollectionFile !== this.props.selectedCollectionFile) {
      this.getCurrentSchema(selectedCollectionFile.collectionType, this.updateEditorForm)
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
      currentFileLanguage: parsedObj.lang
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

  changeFileType(ext) {
    this.setState({currentFileExt: ext}, () => {
      this.updateCurrentFilePath()
    })
  }

  updateCurrentFilePath () {
    const { config } = this.props
    const { currentFileSlug, currentFileExt, currentFileLanguage, currentSchema } = this.state
    let newPathArray = []
    let newFilename = currentFileExt ? (currentFileSlug + '.' + currentFileExt) : currentFileSlug
    if (currentSchema.jekyll.id !== 'pages') {
      newPathArray.push(currentSchema.jekyll.dir)
    }
    if (config && config.languages && currentFileLanguage !== config.languages[0].code) {
      newPathArray.push(currentFileLanguage)
    }
    newPathArray.push(newFilename)
    this.setState({ currentFilePath: newPathArray.join('/')})
  }

  toContentListing() {
    const { toRoute, repoFullName } = this.props
    toRoute(`/${repoFullName}/`)
  }

  render() {
    const { editorUpdating, selectedCollectionFile, params, schemas, config } = this.props
    const { filePathInputClass, formData, currentFilePath, currentSchema, disableActionBtn, currentFileSlug } = this.state

    if (!currentSchema) return (<section id='content' />)

    return (
      <section id='content'>
        <header className='header'>
          <div className='controls'>
            {
              params.splat !== 'new' &&
              (<a className='edit tooltip-bottom'
                href={`${repoUrl}commit/${selectedCollectionFile.lastCommitSha}`} target='_blank'>
                {selectedCollectionFile.lastUpdatedBy},&nbsp;
                {moment(Date.parse(selectedCollectionFile.lastUpdatedAt)).fromNow()}
                <span>View on GitHub</span>
              </a>)
            }
            <span className={disableActionBtn ? 'bundle disabled' : 'bundle'}>
              <button className={disableActionBtn ? 'button primary save processing' : 'button primary save'} onClick={::this.handleSaveBtn}>Save</button>

              <span className="menu">
                <button className="button primary">
                  <MoreMenuIcon />
                </button>
                <div className="options">
                  <a className={this.state.isPostPublished ? 'selected' : 'disabled'} onClick={::this.handlePublishInput}>
                    <CheckIcon />
                    <span>Published</span>
                  </a>
                  <a className={this.state.isDraft ? 'selected' : 'disabled'} onClick={::this.handleDraftInput}>
                    <CheckIcon />
                    <span>Draft</span>
                  </a>
                  <hr />
                  <a className="danger" onClick={evt => {this.setState({showDeleteFileModel: true})}}>
                    <TrashIcon />
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
          </div>
          <button className="button icon tooltip-bottom"
            onClick={::this.toContentListing}>
            <BackArrowIcon />
            <span>Back to all content</span>
          </button>
        </header>

        <div className='body'>
          {config && config.languages &&
            <div className='field'>
              <label>Language</label>
              <span className='select'>
                <select value={this.state.currentFileLanguage} onChange={::this.changeFileLanguage}>
                  {
                    config.languages.map((lang) => {
                      return <option value={lang.code} key={lang.code}>{lang.name}</option>
                    })
                  }
                </select>
              </span>
            </div>
          }

          <div className='field'>
            <label>Slug</label>
            <input
              className={`${filePathInputClass}`}
              type='text'
              value={currentFileSlug}
              onChange={::this.handleFileSlugInput}
              placeholder='File slug' />
            <small className='description'><strong>File path: </strong>{currentFilePath}</small>
          </div>
          <Form
            onChange={res => this.setState({ formData: res.formData })}
            onSubmit={res => this.updateResult(res.formData)}
            schema={currentSchema.JSONSchema}
            uiSchema={currentSchema.uiSchema}
            fields={{ArrayField: CustomArrayField}}
            widgets={customWidgets}
            showErrorList={false}
            formData={formData}>
            <button
              type='submit'
              ref='formSubmitBtn'
              style={{'display': 'none'}}>
              Submit
            </button>
            <span className='menu format'>
              <a>
                {fileExtMapping(this.state.currentFileExt)}
                <CaretDownIcon />
              </a>
              <div className='options'>
                <a className={this.state.currentFileExt === 'md' ? 'selected' : ''}
                  onClick={this.changeFileType.bind(this, 'md')}>
                  <CheckIcon />
                  Markdown
                </a>
                <a className={this.state.currentFileExt === 'html' ? 'selected' : ''}
                  onClick={this.changeFileType.bind(this, 'html')}>
                  <CheckIcon />
                  HTML
                </a>
              </div>
            </span>
          </Form>
        </div>
      </section>
    )
  }
}
