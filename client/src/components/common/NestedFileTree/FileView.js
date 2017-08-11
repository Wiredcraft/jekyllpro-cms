import React from 'react';

const FileView = props => {
  let { file, fileClickHandler, selectedFilePath, fileTemplate } = props;

  let fileClassName = (props.fileClassName || '') + ' item nft-item';
  let selectedClassName = props.selectedClassName || 'active';
  let cns =
    selectedFilePath === file.path
      ? selectedClassName + ' ' + fileClassName
      : fileClassName;
  let onclickFn = () => {
    fileClickHandler && fileClickHandler(file);
  };

  return (
    <div key={`file-${file.path}`} className={cns} onClick={onclickFn}>
      {(fileTemplate && fileTemplate(file)) ||
        <a>
          |__{file.name}
        </a>}
    </div>
  );
};

export default FileView;
