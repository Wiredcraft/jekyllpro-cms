import React, { Component } from 'react'
import Modal from 'react-modal'
import ModalCustomStyle from './index'

const RepoSelectionModal = (props) => {
  return (
    <Modal
      style={ModalCustomStyle}
      onAfterOpen={props.afterOpen}
      onRequestClose={props.onclose}
      isOpen={props.isOpen}>
      <header className="header">
        <a className="close" onClick={props.onclose}>Close</a>
        <h2>Select a repository</h2>
      </header>
      <section className="body">
        <header className="selected">
          <h3>Wiredcraft/beta.starbucks.com.cn <span className="type info">Private</span></h3>
          <small>Updated just now</small>
        </header>

        <header className="search">
          <input type="text" placeholder="Search repositories by name" />
          <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
            <path d="M0 0h24v24H0z" fill="none"></path>
          </svg>
        </header>
        <div className="default">Search repositories by keywords</div>
      </section>
    </Modal>
  )
}

export default RepoSelectionModal