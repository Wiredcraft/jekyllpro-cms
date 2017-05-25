import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import ReactDOM from 'react-dom'
import moment from 'moment'
import Cookie from 'js-cookie'
import { Link } from 'react-router'
import Select from 'react-select'

import { parseYamlInsideMarkdown, retriveContent, serializeObjtoYaml } from '../../helpers/markdown'
import TrashIcon from '../svg/TrashIcon'
import MoreMenuIcon from '../svg/MoreMenuIcon'
import CheckIcon from '../svg/CheckIcon'
import BackArrowIcon from '../svg/BackArrowIcon'
import CaretDownIcon from '../svg/CaretDownIcon'
import ExternalLinkIcon from '../svg/ExternalLinkIcon'
import LockIcon from '../svg/LockIcon'
import TranslationIcon from '../svg/TranslationIcon'

import customWidgets from '../JSONSchemaForm/CustomWidgets'
import CustomArrayField from '../JSONSchemaForm/CustomArrayField'
import { dateToString, purgeObject, textValueIsDifferent,
  parseFilePath, parseNameFromFilePath, parseFilePathByLang } from "../../helpers/utils"
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
      disableActionBtn: false,
      fileModified: false
    }
  }

  componentWillMount() {
    const { selectedCollectionFile } = this.props

    if (selectedCollectionFile) {
      return this.getCurrentSchema(selectedCollectionFile.collectionType, this.updateEditorForm)
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
    const { selectedCollectionFile, config, collections } = this.props
    const { content, path } = selectedCollectionFile
    const { currentSchema } = this.state
    if (!content) return
    let formData = {}

    // content is markdown or html
    const docConfigObj = parseYamlInsideMarkdown(content)
    // console.log(docConfigObj)
    if(docConfigObj && !docConfigObj['__error']) {
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
      parsorError: docConfigObj && docConfigObj['__error'],
      formData,
      isPostPublished: (formData.published !== undefined) ? formData.published : true,
      isDraft: (formData.draft !== undefined) ? formData.draft : false,
      // language: formData.lang ? formData.lang : 'cn'
    }, () => {
      this.setParsedFileProps(path)
    })


    let rootFolder = currentSchema.jekyll.id === 'pages' ? '/' : currentSchema.jekyll.dir
    this.getTranslation(selectedCollectionFile, collections, config, rootFolder)
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
      collectionFileRemoved,
      collectionFileUpdated,
      toRoute,
      params: { repoOwner, repoName, collectionType, branch, splat }
    } = this.props
    const { currentSchema, isPostPublished, isDraft, language, currentFileLanguage } = this.state
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
    if (currentFileLanguage) {
      formData.lang = currentFileLanguage
    }
    // delete all undefined property
    purgeObject(formData)

    this.setState({ disableActionBtn: true, formData: data })

    if (filePath !== selectedCollectionFile.path) {
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
          this.setState({ disableActionBtn: false, fileModified: false })
        })
    } else {
      updatedContent = this.updateFileFrontMatter(selectedCollectionFile.content, formData) + updatedContent

      if (!textValueIsDifferent(selectedCollectionFile.content, updatedContent)) {
        this.setState({ disableActionBtn: false, fileModified: false })
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
          this.setState({ disableActionBtn: false, fileModified: false })
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
    this.setState({
      isPostPublished: !isPostPublished,
      fileModified: true
    })
  }

  handleDraftInput(evt) {
    const { isDraft } = this.state
    this.setState({
      isDraft: !isDraft,
      fileModified: true
    })
  }

  closeDeleteFileModel () {
    this.setState({showDeleteFileModel: false})
  }

  handleFileSlugInput(evt) {
    this.setState({ currentFileSlug: evt.target.value }, () => {
      this.updateCurrentFilePath()
    })
  }

  handleSlugSelect(selected) {
    this.setState({currentFileExt: selected.value}, () => {
      this.updateCurrentFilePath()
    })
  }

  getTranslation(selectedCollectionFile, collections, config, rootFolder) {
    if (!config || !config.languages) {
      return
    }

    let fileName = parseNameFromFilePath(selectedCollectionFile.path)
    let availableLanguages = config.languages

    let translations = collections.filter(col => {
      return (col.path.indexOf(fileName) > -1) && (col.path !== selectedCollectionFile.path) &&
        (col.collectionType === selectedCollectionFile.collectionType)
    })

    translations = translations.map(c => {
      let code = parseFilePathByLang(c.path, config.languages, rootFolder)
      let matchedLang = config.languages.find(l => {
        return l.code === code
      })
      return { filePath: c.path, language: matchedLang.name ,code }
    })

    translations.forEach(t => {
      availableLanguages = availableLanguages.filter(l => {
        return l.code !== t.code
      })
    })

    this.setState({
      availableLanguages,
      translations
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
    this.setState({
      currentFilePath: newPathArray.join('/'),
      fileModified: true
    })
  }

  toContentListing() {
    const { toRoute, repoFullName } = this.props
    toRoute(`/${repoFullName}/`)
  }

  render() {
    const { editorUpdating, selectedCollectionFile, params, schemas, config,
      repoFullName, currentBranch } = this.props
    const { filePathInputClass, formData, currentFilePath, availableLanguages, translations,
      currentSchema, disableActionBtn, currentFileSlug, fileModified, parsorError } = this.state

    let needTranslation = availableLanguages && availableLanguages.filter((lang) => {
      return lang.code !== this.state.currentFileLanguage
    })

    if (!currentSchema) return (<section id='content' />)

    return (
      <section id='content' className='editor'>
        <header className='header'>
          <div className='controls'>
            <span className={disableActionBtn ? 'bundle disabled' : 'bundle'}>
              <button
                className={fileModified
                  ? (disableActionBtn ? 'button disabled save processing' : 'button primary save')
                  : 'button disabled save'}
                onClick={::this.handleSaveBtn}>
                Save
              </button>

              <span className="menu">
                <button className={fileModified ? 'button icon primary' : 'button icon'}>
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
          <small className='meta'>
            <strong>{selectedCollectionFile.collectionType}</strong>&nbsp;
            <a className='edit tooltip-bottom'
              href={`${repoUrl}commit/${selectedCollectionFile.lastCommitSha}`} target='_blank'>
              Updated&nbsp;
              {moment(Date.parse(selectedCollectionFile.lastUpdatedAt)).fromNow()}&nbsp;
              by&nbsp;
              {selectedCollectionFile.lastUpdatedBy}
              <span>View on GitHub</span>
            </a>
          </small>
          {
            parsorError &&
            <div className='error-msg-block'>
              Unable to parse fields properly as {parsorError}
            </div>
          }
          {config && config.languages &&
            <div className='field language'>
              <label>Language</label>
              <span className='bundle'>
                <span className='menu'>
                  <button className='button active locked'>
                    {
                      availableLanguages && availableLanguages.filter((lang) => {
                        return lang.code === this.state.currentFileLanguage
                      }).map((language) => {
                        return (<span key={language.code}>{language.name}&nbsp;</span>)
                      })              
                    }
                    <LockIcon />
                  </button>
                </span>
                <span className='menu'>
                  <button className='button icon'><TranslationIcon /></button>
                  <div className='options'>
                    { needTranslation && needTranslation.length && (<h2>Translate to</h2>) || '' }
                    {
                      needTranslation && needTranslation.map((lang) => {
                        return (
                          <Link key={lang.code}
                            to={`/${repoFullName}/${params.collectionType}/${currentBranch}/new?baseFile=${params.splat}&language=${lang.code}&branch=${currentBranch}`}
                            target='_blank'>
                            <TranslationIcon />
                            {lang.name}
                          </Link>
                        )
                      })
                    }
                    { needTranslation && needTranslation.length && translations && translations.length && (<hr />) || '' }
                    { translations && translations.length && (<h2>Existing translations</h2>) || '' }
                    {
                      translations && translations.map(t => {
                        return (
                          <Link
                            to={`/${repoFullName}/${params.collectionType}/${currentBranch}/${t.filePath}`}
                            key={t.code}
                            target='_blank'>
                            <ExternalLinkIcon />{t.language}
                          </Link>
                        )
                      })
                    }
                  </div>
                </span>
              </span>
            </div>
          }

          <div className='field slug'>
            <label>Slug</label>
            <input
              className={`${filePathInputClass}`}
              type='text'
              value={currentFileSlug}
              onChange={::this.handleFileSlugInput}
              placeholder='File slug' />
            <small className='description'><strong>File path: </strong>{currentFilePath}</small>
          </div>
          <div className='field format'>
            <label>Format</label>
            <Select
              clearable={false}
              value={this.state.currentFileExt}
              options={[{value: 'md', label: 'Markdown'}, {value: 'html', label: 'HTML'}]}
              onChange={::this.handleSlugSelect} />
          </div>
          <Form
            onChange={res => this.setState({ formData: res.formData, fileModified: true })}
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
          </Form>
        </div>
      </section>
    )
  }
}
