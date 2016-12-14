import React from 'react'
import Modal from 'react-modal'
import ModalCustomStyle from '../Modal'
import ModalCloseIcon from '../svg/ModalCloseIcon'
import UploaderIcon from '../svg/UploaderIcon'
import FileManager from '../common/FileManager'

const FileManagerModal = (props) => {
  return (
    <Modal
      contentLabel='File manager'
      className='file-picker'
      style={ModalCustomStyle}
      isOpen={props.isOpen}
      onRequestClose={props.onclose} >
      <header className='header'>
        <a className='close' id='close-modal' onClick={props.onclose}>
          <ModalCloseIcon />
        </a>
        <h2>Select a file?</h2>
      </header>
      <section className='body'>
        <FileManager />
      </section>
      <footer className='footer'>
        <div className='controls'>
          <button className='button primary tooltip'>
            Upload a file
            <UploaderIcon />
          </button>
        </div>
        <button className='button primary disabled'>Select</button>
      </footer>
    </Modal>
  )
}

export default FileManagerModal
