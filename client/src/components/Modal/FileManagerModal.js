import React, { Component } from 'react'
import Modal from 'react-modal'
import ModalCustomStyle from '../Modal'
import ModalCloseIcon from '../svg/ModalCloseIcon'

import FileManager from '../common/FileManager'
import FileUploader from '../common/FileUploader'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchRepoTree, fileAdded } from '../../actions/repoActions'
import { addNewFile } from '../../actions/editorActions'

@connect(mapStateToProps, mapDispatchToProps)
export default class FileManagerModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedFolderPath: '/',
      disableSelectBtn: true
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOpen && !this.props.isOpen) {
      this.setState({
        selectedFolderPath: '/',
        disableSelectBtn: true
      })
    }
  }

  fileCallback(filepath) {
    this.setState({ selectedFilePath: filepath, disableSelectBtn: false })
  }

  folderCallback(name, path) {
    this.setState({
      selectedFilePath: '',
      disableSelectBtn: true,
      selectedFolderPath: path
     })

  }

  handleSelectBtn() {
    this.props.handleSelect(this.state.selectedFilePath)
    this.props.onclose()
  }

  render() {
    const { isOpen, onclose, treeMeta, currentBranch, addNewFile, fileAdded, fetchRepoTree } = this.props
    const { disableSelectBtn, selectedFolderPath } = this.state

    return (
      <Modal
        contentLabel='File manager'
        className='file-picker'
        style={ModalCustomStyle}
        isOpen={isOpen}
        onRequestClose={onclose} >
        <header className='header'>
          <a className='close' id='close-modal' onClick={onclose}>
            <ModalCloseIcon />
          </a>
          <h2>Select a file?</h2>
        </header>
        <section className='body'>
          <FileManager
            treeMeta={treeMeta}
            currentBranch={currentBranch}
            fetchRepoTree={fetchRepoTree}
            folderCallback={::this.folderCallback}
            fileCallback={::this.fileCallback} />
        </section>
        <footer className='footer'>
          <FileUploader
            currentBranch={currentBranch}
            addNewFile={addNewFile}
            fileAdded={fileAdded}
            uploadFolder={selectedFolderPath} />
          <button
            onClick={::this.handleSelectBtn}
            className={disableSelectBtn ? 'button primary disabled' : 'button primary'}>
            Select
          </button>
        </footer>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  var repoState = state.repo.toJSON();
  return {
    currentBranch: repoState.currentBranch,
    treeMeta: repoState.treeMeta
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    addNewFile,
    fileAdded,
    fetchRepoTree
  }, dispatch)
}
