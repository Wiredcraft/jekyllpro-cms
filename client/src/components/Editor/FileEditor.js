import React, { Component } from 'react'
import Form from 'react-jsonschema-form'
import ReactDOM from 'react-dom'

import { getRepoMeta } from '../../helpers/api'
import { parseYamlInsideMarkdown, retriveContent, serializeObjtoYaml } from '../../helpers/markdown'
import DeleteIcon from '../svg/DeleteIcon'
import customWidgets from './CustomWidgets'
import { notTextFile, isImageFile } from "../../helpers/utils"
import ConfirmDeletionModal from '../Modal/ConfirmDeletionModal'
import notify from '../common/Notify'

const defaultSchema = require('../../schema/file.json')

export default class FileEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      targetFile: props.params ? props.params.splat : undefined,
      currentFilePath: '',
      filePathInputClass: '',
      formData: {},
      showDeleteFileModel: false,
      notTextFile: false,
      disableActionBtn: false
    }
  }

  componentWillMount() {
    const { params } = this.props
    if (params.splat) {
      this.updateView(params.branch, params.splat)      
    }
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props
    const fileChanged = params.splat !== prevProps.params.splat 

    if (fileChanged) {
      this.updateView(params.branch, params.splat)
    }
  }

  updateView(branch, path) {
    if (path === 'new') {
      return this.setState({
        formData: {},
        currentFilePath: 'file_path',
        targetFile: null,
        notTextFile: false
      })      
    }
    if (notTextFile(path)) {
      return this.setState({
        formData: {},
        currentFilePath: path,
        targetFile: null,
        notTextFile: true
      })
    }
    let request = getRepoMeta({ branch, path, raw: true})
    this.props.updatingEditor(request)
      .then(content => {
        if (typeof content === 'object') {
          content = JSON.stringify(content)
        }
        this.setState({
          formData: { body: content },
          currentFilePath: path,
          targetFile: path,
          notTextFile: false
        })
      })  
  }

  updateResult(data) {
    const formData = Object.assign({}, data)
    const {
      currentBranch,
      toRoute,
      fileAdded,
      fileReplaced,
      updateFile,
      replaceFile,
      addNewFile,
      params: { repoOwner, repoName, splat }
    } = this.props
    const { targetFile, currentFilePath } = this.state
    // const filePath = this.refs.filePath.value
    let reqPromise = null

    if (!currentFilePath) {
      console.error('no file path specified')
      this.setState({filePathInputClass: 'error'})
      return
    }
    let updatedContent = formData.body

    this.setState({ disableActionBtn: true })

    if (splat === 'new') {
      reqPromise = addNewFile(currentBranch, currentFilePath, updatedContent)
        .then(() => {
          fileAdded(currentFilePath)
          toRoute(`/${repoOwner}/${repoName}/files/${currentBranch}/`)
        })
    } else if (currentFilePath !== targetFile) {
      // file path changed
      reqPromise = replaceFile(currentBranch, targetFile, currentFilePath, updatedContent)
        .then(() => {
          fileReplaced(targetFile, currentFilePath)
          toRoute(`/${repoOwner}/${repoName}/files/${currentBranch}/`)
        })
    } else {
      this.setState({ formData: { body: updatedContent } })
      reqPromise = updateFile(currentBranch, targetFile, updatedContent)
        .then(() => {
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

  handleSaveBtn() {
    let clickEvt = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    })
    ReactDOM.findDOMNode(this.refs.formSubmitBtn).dispatchEvent(clickEvt)
  }

  handleDeleteFile() {
    const { currentBranch, deleteFile, fileRemoved, toRoute, params: { repoOwner, repoName, splat } } = this.props
    const { targetFile } = this.state
    if (splat === 'new') {
      return this.closeDeleteFileModel()
    }
    this.closeDeleteFileModel()
    this.setState({ disableActionBtn: true })
    deleteFile(currentBranch, targetFile)
      .then(() => {
        fileRemoved(targetFile)
        toRoute(`/${repoOwner}/${repoName}/files/${currentBranch}/`)
        notify('success', 'File deleted!')
      })
      .catch(err => {
        this.setState({ disableActionBtn: false })
        notify('error', 'Unable to complete the operation!')
      })
  }

  closeDeleteFileModel () {
    this.setState({showDeleteFileModel: false})
  }

  handleFilePathInput(evt) {
    this.setState({currentFilePath: evt.target.value})
  }

  render() {
    const { newFileMode, editorUpdating, params, repoFullName, currentBranch } = this.props
    const { filePathInputClass, formData, currentFilePath, notTextFile, disableActionBtn } = this.state

    if (notTextFile) {
      if (isImageFile(currentFilePath)) {
        return (
          <section id='content'>
            <img src={`https://github.com/${repoFullName}/blob/${currentBranch}/${currentFilePath}?raw=true`} />
          </section>
        )
      }
      return (
        <section id='content'>
          <a href={`https://github.com/${repoFullName}/blob/${currentBranch}/${currentFilePath}?raw=true`} target='_blank'>
            {currentFilePath}
          </a>
        </section>
      )        
    }

    return (
      <section id='content' className={editorUpdating ? 'loading' : ''}>
        <aside className='sidebar'>
          <span className={disableActionBtn ? 'bundle loading' : 'bundle'}>
            <button className="button primary save" onClick={::this.handleSaveBtn}>Save</button>

            <span className="menu">
              <button className="button primary">
                <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"></path>
                </svg>
              </button>
              <div className="options">
                <a className="danger" onClick={evt => {this.setState({showDeleteFileModel: true})}}>
                  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"></path>
                  </svg>
                  Delete
                </a>
                <ConfirmDeletionModal
                  isOpen={this.state.showDeleteFileModel}
                  onclose={::this.closeDeleteFileModel}
                  onsubmit={::this.handleDeleteFile}
                  oncancel={::this.closeDeleteFileModel} />
              </div>
            </span>
          </span>
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
            schema={defaultSchema.JSONSchema}
            uiSchema={defaultSchema.uiSchema}
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
