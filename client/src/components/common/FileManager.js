import React, { Component } from 'react'
import NestedFileTreeView from 'react-nested-file-tree'

import { parseFileTree, parseFolderPath, parseFolderObj } from '../../helpers/utils'
import FileIcon from '../svg/FileIcon'
import FolderIcon from '../svg/FolderIcon'
import HomeIcon from '../svg/HomeIcon'
import ClosedFolderIcon from '../svg/ClosedFolderIcon'

function CustomFolder (props) {
  return (
    <a onClick={props.onclick}>
      <ClosedFolderIcon />
      <span>{props.name}</span>
    </a>
  )
}

function CustomFile (props) {
  return (
    <a>
      <FileIcon />
      <span>{props.name}</span>
    </a>
  )
}


export default class FileManager extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentPath: '/',
      records: props.treeMeta && parseFileTree(props.treeMeta)
    }
  }

  componentWillMount() {
    const { fetchRepoTree, currentBranch } = this.props
    fetchRepoTree(currentBranch).then(data => {
      this.setState({ records: parseFileTree(data.tree) })
    })
  }

  componentWillReceiveProps(nextProps) {
    const { treeMeta } = nextProps
    const { currentPath } = this.state

    if (this.treeMeta && (treeMeta.length !== this.treeMeta.length)) {
      this.setState({
        records: parseFolderObj(currentPath, parseFileTree(treeMeta))
      })
    }
  }

  handleFileClick (file) {
    console.log(file)
    this.setState({ selectedFile: file.path })
    this.props.fileCallback(file.path)
  }

  handleFolderClick (folderName, path, Obj) {
    const { treeMeta, folderCallback } = this.props
    const { currentPath } = this.state
    let newPath = currentPath === '/' ? ('/' + folderName) : (currentPath + '/' + folderName)

    folderCallback(folderName, newPath)
    this.setState({
      currentPath: newPath,
      records: Obj
    })
  }

  handleBreadscrumLink (folderPathArray) {
    const { treeMeta, folderCallback } = this.props
    let newPath = '/' + folderPathArray.join('/')

    folderCallback('', newPath)

    this.setState({
      currentPath: newPath,
      records: parseFolderObj(newPath, parseFileTree(treeMeta))
    })
  }

  render() {
    const { treeMeta } = this.props
    const { records, currentPath } = this.state

    if (!records) {
      return (<div className='loading' style={{height: '400px'}} />)
    }

    return (
      <div className='file-manager'>
        <header className='breadcrumb'>
          <a onClick={() => {this.setState({
              currentPath: '/',
              records: treeMeta && parseFileTree(treeMeta)
            })}}>
            <HomeIcon />
          </a>/
          {
            parseFolderPath(currentPath).map((folder, idx) => {
              return (
                <span key={idx}>&nbsp;
                  <a onClick={this.handleBreadscrumLink.bind(this, folder.pathArray)}>
                  {folder.name}&nbsp;/
                  </a>
                </span>
              )
            })
          }
        </header>
        <NestedFileTreeView
          selectedFilePath={this.state.selectedFile}
          fileTemplate={CustomFile}
          folderTemplate={CustomFolder}
          fileClickHandler={::this.handleFileClick}
          folderClickHandler={::this.handleFolderClick}
          directory={records} />
      </div>
    )
  }
}

