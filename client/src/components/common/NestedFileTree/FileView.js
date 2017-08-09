import React from 'react';
import cx from 'classnames';

const FileView = props => {
  let { file, fileClickHandler, selectedFilePath, fileTemplate } = props;

  let selectedClassName = props.selectedClassName || 'active';
  let cns = cx('item nft-item', props.fileClassName, {
    [selectedClassName]: selectedFilePath === file.path
  });

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
