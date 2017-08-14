import React, { Component } from 'react';
import cx from 'classnames';
import FileView from './FileView';

class FolderView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: props.expended || false
    };
  }

  toggleFolder() {
    const { open } = this.state;
    const { name, parentPath, folderObj } = this.props;
    const currentPath = parentPath + '/' + name;

    this.setState({ open: !open }, () => {
      let fn = this.props.folderClickHandler;
      fn && fn(name, currentPath, folderObj);
    });
  }

  render() {
    const {
      level,
      name,
      parentPath,
      folderObj,
      maxFolderLevel,
      expended,
      folderTemplate,
      fileTemplate,
      fileClassName,
      folderClassName,
      fileClickHandler,
      selectedFilePath,
      folderClickHandler
    } = this.props;
    const { open } = this.state;
    let currentPath = parentPath ? parentPath + '/' + name : name;
    let isExpended = expended || selectedFilePath.indexOf(currentPath) === 0 || open;
    let styl = isExpended ? { display: 'block' } : { display: 'none' };
    let cns = cx('subFolder nft-item', folderClassName, {
      'open': isExpended,
      'active': currentPath === selectedFilePath
    });
    let passedFolderProps = {
      maxFolderLevel,
      expended,
      folderTemplate,
      fileTemplate,
      fileClickHandler,
      fileClassName,
      folderClassName,
      selectedFilePath,
      folderClickHandler
    };

    return (
      <div key={`folder-${name}`} className={cns}>
        {(folderTemplate &&
          folderTemplate({
            name,
            folderObj,
            currentPath,
            onclick: this.toggleFolder.bind(this)
          })) ||
          <a onClick={::this.toggleFolder}>
            /{name}
          </a>}

        <div style={styl} data-level={level} className="nft-container">
          {folderObj &&
            folderObj['_contents'].map(f => {
              return (
                <FileView
                  key={`file-${f.path}`}
                  file={f}
                  fileTemplate={fileTemplate}
                  fileClickHandler={fileClickHandler}
                  fileClassName={fileClassName}
                  selectedFilePath={selectedFilePath}
                />
              );
            })}
          {(parseInt(maxFolderLevel) && maxFolderLevel > level) ||
          isNaN(parseInt(maxFolderLevel))
            ? folderObj &&
              Object.keys(folderObj)
                .filter(k => {
                  return k !== '_contents' && k !== '_meta';
                })
                .map(prop => {
                  return (
                    <FolderView
                      key={`folder-${name}-${prop}`}
                      level={level + 1}
                      name={prop}
                      parentPath={parentPath ? `${parentPath}/name` : name}
                      folderObj={folderObj[prop]}
                      {...passedFolderProps}
                    />
                  );
                })
            : <span className="more">...</span>}
        </div>
      </div>
    );
  }
}

export default FolderView;
