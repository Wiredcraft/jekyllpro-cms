import React, { Component } from 'react'
import Modal from 'react-modal'
import ModalCustomStyle from './index'
import RepoSelectionModalBody from './RepoSelectionModalBody'

export default (props) => {
  const { afterOpen, onclose, isOpen } = props
  return (
    <Modal
      style={ModalCustomStyle}
      onAfterOpen={afterOpen}
      onRequestClose={onclose}
      isOpen={isOpen}>
      <header className="header">
        <a className="close" onClick={onclose}>Close</a>
        <h2>Select a repository</h2>
      </header>
      <RepoSelectionModalBody {...props} />
    </Modal>
  )
}
