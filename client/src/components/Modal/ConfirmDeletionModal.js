import React from 'react'
import Modal from 'react-modal'
import ModalCustomStyle from '../Modal'

const confirmDeleteionModal = (props) => {
  return (
    <Modal
      className='confirm-deletion'
      style={ModalCustomStyle}
      isOpen={props.isOpen}
      onRequestClose={props.onclose} >
      <header className='header'>
        <a className='close' id='close-modal' onClick={props.onclose}>
          <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
          </svg>
        </a>
        <h2>Are you sure to delete this file?</h2>
      </header>
      <section className='body'>
        <p>
          <button className='button primary' onClick={props.onsubmit}>Yes</button>
          <button className='button' onClick={props.oncancel}>Cancel</button>
        </p>
      </section>
    </Modal>
  )
}

export default confirmDeleteionModal
