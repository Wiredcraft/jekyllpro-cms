import React, { Component } from 'react';
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
    let styl = open ? { display: 'block' } : { display: 'none' };
    let cns = (folderClassName || '') + ' subFolder nft-item';
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
      <div key={`folder-${name}`} className={open ? `open ${cns}` : cns}>
        {(folderTemplate &&
          folderTemplate({
            name,
            folderObj,
            currentPath: parentPath + '/' + name,
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
                  return k !== '_contents';
                })
                .map(prop => {
                  return (
                    <FolderView
                      key={`folder-${name}-${prop}`}
                      level={level + 1}
                      name={prop}
                      parentPath={parentPath + '/' + name}
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
