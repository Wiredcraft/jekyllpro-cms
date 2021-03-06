import React from 'react';
import Modal from 'react-modal';
import ModalCustomStyle from '../Modal';
import ModalCloseIcon from '../svg/ModalCloseIcon';

const confirmDeleteionModal = props => {
  return (
    <Modal
      contentLabel="Confirm removal"
      className="confirm-deletion"
      style={ModalCustomStyle}
      isOpen={props.isOpen}
      onRequestClose={props.onclose}
    >
      <header className="header">
        <a className="close" id="close-modal" onClick={props.onclose}>
          <ModalCloseIcon />
        </a>
        <h2>Are you sure to delete this file?</h2>
      </header>
      <section className="body">
        <p>
          <button className="button primary" onClick={props.onsubmit}>
            Yes
          </button>
          <button className="button" onClick={props.oncancel}>
            Cancel
          </button>
        </p>
      </section>
    </Modal>
  );
};

export default confirmDeleteionModal;
