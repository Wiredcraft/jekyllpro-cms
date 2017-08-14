import React, { Component } from 'react';
import TrashIcon from '../svg/TrashIcon';
import MoreMenuIcon from '../svg/MoreMenuIcon';
import CheckIcon from '../svg/CheckIcon';
import BackArrowIcon from '../svg/BackArrowIcon';

const EditorHeader = props => {
  const {
    btnBundleClassName,
    saveBtnClassName,
    handleSaveBtn,
    menuBtnClassName,
    publishBtnClassName,
    handlePublishInput,
    draftBtnClassName,
    handleDraftInput,
    handleDeleteBtn,
    handleBackBtn
  } = props;

  return (
    <header className="header">
      <div className="controls">
        <span className={btnBundleClassName}>
          <button className={saveBtnClassName} onClick={handleSaveBtn}>
            Save
          </button>

          <span className="menu">
            <button className={menuBtnClassName}>
              <MoreMenuIcon />
            </button>
            <div className="options">
              <a className={publishBtnClassName} onClick={handlePublishInput}>
                <CheckIcon />
                <span>Published</span>
              </a>
              <a className={draftBtnClassName} onClick={handleDraftInput}>
                <CheckIcon />
                <span>Draft</span>
              </a>
              <hr />
              <a className="danger" onClick={handleDeleteBtn}>
                <TrashIcon />
                Delete
              </a>
            </div>
          </span>
        </span>
      </div>
      <button className="button icon tooltip-bottom" onClick={handleBackBtn}>
        <BackArrowIcon />
        <span>Back to all content</span>
      </button>
    </header>
  );
};

export default EditorHeader;
