import React, { Component } from 'react';
import NestedFileTreeView from './NestedFileTree';

import {
  parseFileTree,
  parseFolderPath,
  parseFolderObj
} from '../../helpers/utils';
import { getRepoMeta } from '../../helpers/api';
import FileIcon from '../svg/FileIcon';
import FolderIcon from '../svg/FolderIcon';
import HomeIcon from '../svg/HomeIcon';
import ClosedFolderIcon from '../svg/ClosedFolderIcon';

function CustomFolder(props) {
  return (
    <a onClick={props.onclick}>
      <ClosedFolderIcon />
      <span className="name">
        {props.name}
      </span>
    </a>
  );
}

function CustomFile(props) {
  return (
    <a>
      {props.displayRaw ? <img src={props.download_url} /> : <FileIcon />}
      <span className="name">
        {props.name}
      </span>
    </a>
  );
}

export default class FileManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updating: false,
      gridView: false
    };
  }

  componentWillMount() {
    const { treeMeta, fetchRepoTree, currentBranch, defaultPath } = this.props;
    if (treeMeta) {
      this.setInitialRecordsAndPath(treeMeta, defaultPath);
    } else {
      fetchRepoTree(currentBranch).then(data => {
        this.setInitialRecordsAndPath(data.tree, defaultPath);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { treeMeta, currentBranch } = nextProps;
    const thisTreeMeta = this.props.treeMeta;
    const { currentPath, gridView } = this.state;

    if (thisTreeMeta && treeMeta.length !== thisTreeMeta.length) {
      let parsedRecords = parseFolderObj(currentPath, parseFileTree(treeMeta));

      if (gridView) {
        this.setState({ updating: true });
        this.updateRecordsMeta(
          currentBranch,
          currentPath,
          parsedRecords
        ).then(updatedR => {
          this.setState({
            updating: false,
            records: updatedR
          });
        });
      } else {
        this.setState({
          records: parsedRecords
        });
      }
    }
  }

  setInitialRecordsAndPath(treeMeta, defaultPath) {
    let currRecords = parseFileTree(treeMeta);
    let currPath = '/';
    if (defaultPath) {
      try {
        currPath =
          defaultPath.indexOf('/') === 0 ? defaultPath : '/' + defaultPath;
        currRecords = parseFolderObj(defaultPath, currRecords);
      } catch (err) {
        console.log(defaultPath, ' is not existing path');
      }
      console.log(defaultPath, currRecords);
    }
    this.setState({
      currentPath: currPath,
      records: currRecords
    });
  }

  handleFileClick(file) {
    console.log(file);
    this.setState({ selectedFile: file.path });
    this.props.fileCallback('/' + file.path);
  }

  handleFolderClick(folderName, path, Obj) {
    const { treeMeta, folderCallback, currentBranch } = this.props;
    const { currentPath, gridView } = this.state;
    let newPath =
      currentPath === '/' ? '/' + folderName : currentPath + '/' + folderName;
    folderCallback(folderName, newPath);
    if (gridView) {
      this.setState({ updating: true });
      this.updateRecordsMeta(currentBranch, newPath, Obj).then(updatedConts => {
        this.setState({
          updating: false,
          currentPath: newPath,
          records: updatedConts
        });
      });
    } else {
      this.setState({
        currentPath: newPath,
        records: Obj
      });
    }
  }

  handleBreadscrumLink(folderPathArray) {
    const { treeMeta, folderCallback, currentBranch } = this.props;
    const { gridView } = this.state;
    let newPath = '/' + folderPathArray.join('/');
    let currRecords = parseFolderObj(newPath, parseFileTree(treeMeta));
    folderCallback('', newPath);

    if (gridView) {
      this.setState({ updating: true });
      this.updateRecordsMeta(
        currentBranch,
        newPath,
        currRecords
      ).then(updated => {
        this.setState({
          updating: false,
          currentPath: newPath,
          records: updated
        });
      });
    } else {
      this.setState({
        currentPath: newPath,
        records: currRecords
      });
    }
  }

  handleListView() {
    const { gridView, records } = this.state;
    if (gridView) {
      let newCont = records['_contents'].map(f => ({
        name: f.name,
        path: f.path
      }));

      this.setState({
        gridView: false,
        records: Object.assign({}, records, { _contents: newCont })
      });
    }
  }

  handleGridView() {
    const { currentBranch } = this.props;
    const { gridView, currentPath, records } = this.state;
    if (!gridView) {
      this.setState({ updating: true });
      this.updateRecordsMeta(
        currentBranch,
        currentPath,
        records
      ).then(updatedRecords => {
        this.setState({
          updating: false,
          gridView: true,
          records: updatedRecords
        });
      });
    }
  }

  updateRecordsMeta(branch, path, records) {
    return getRepoMeta({
      branch,
      path: path.replace(/^\/+/gi, '')
    }).then(data => {
      let currentFolderFiles = data.filter(d => d.type === 'file').map(f => ({
        download_url: f.download_url,
        name: f.name,
        path: f.path,
        displayRaw: /\.(png|jpg|jpge|gif|svg?)(\?[a-z0-9]+)?$/g.test(f.name)
      }));

      return Object.assign({}, records, { _contents: currentFolderFiles });
    });
  }

  render() {
    const { treeMeta } = this.props;
    const { records, currentPath, gridView, updating } = this.state;
    if (!records || updating) {
      return <div className="loading" style={{ height: '400px' }} />;
    }

    return (
      <div className="file-manager">
        <header>
          <div className="breadcrumb">
            <a
              onClick={() => {
                this.setState({
                  currentPath: '/',
                  records: treeMeta && parseFileTree(treeMeta)
                });
              }}
            >
              <HomeIcon />
            </a>/
            {parseFolderPath(currentPath).map((folder, idx) => {
              return (
                <span key={idx}>
                  &nbsp;
                  <a
                    onClick={this.handleBreadscrumLink.bind(
                      this,
                      folder.pathArray
                    )}
                  >
                    {folder.name}&nbsp;/
                  </a>
                </span>
              );
            })}
          </div>
          <div className="view-control">
            <button
              className={
                gridView
                  ? 'button tooltip-bottom icon'
                  : 'button tooltip-bottom icon active'
              }
              onClick={::this.handleListView}
            >
              <svg className="icon-svg icon-view_list">
                <use xlinkHref="#icon-view_list" />
              </svg>
              <span>List view</span>
            </button>
            <button
              className={
                gridView
                  ? 'button tooltip-bottom icon active'
                  : 'button tooltip-bottom icon'
              }
              onClick={::this.handleGridView}
            >
              <svg className="icon-svg icon-view_module">
                <use xlinkHref="#icon-view_module" />
              </svg>
              <span>Icon view</span>
            </button>
          </div>
        </header>
        <NestedFileTreeView
          className={gridView ? 'grid-view' : ''}
          selectedFilePath={this.state.selectedFile}
          fileTemplate={CustomFile}
          folderTemplate={CustomFolder}
          fileClickHandler={::this.handleFileClick}
          folderClickHandler={::this.handleFolderClick}
          directory={records}
        />
      </div>
    );
  }
}
