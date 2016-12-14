import React, { Component } from 'react'
import Modal from 'react-modal'
import ModalCustomStyle from '../Modal'
import ModalCloseIcon from '../svg/ModalCloseIcon'
import UploaderIcon from '../svg/UploaderIcon'
import FileManager from '../common/FileManager'

export default class FileManagerModal extends Component {
  constructor(props) {
    super(props)
    this.state = { disableSelectBtn: true }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOpen && !this.props.isOpen) {
      this.setState({ disableSelectBtn: true })
    }
  }

  fileCallback(filepath) {
    this.setState({ selectedFilePath: filepath, disableSelectBtn: false })
  }

  folderCallback(name) {
    this.setState({ selectedFilePath: '', disableSelectBtn: true })

  }

  handleSelectBtn() {
    this.props.handleSelect(this.state.selectedFilePath)
    this.props.onclose()
  }

  render() {
    const { isOpen, onclose } = this.props
    const { disableSelectBtn } = this.state

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
            folderCallback={::this.folderCallback}
            fileCallback={::this.fileCallback} />
        </section>
        <footer className='footer'>
          <div className='controls'>
            <button className='button primary tooltip'>
              Upload a file
              <UploaderIcon />
            </button>
          </div>
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

