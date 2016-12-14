import React, { Component } from 'react'
import NestedFileTreeView from 'react-nested-file-tree'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { parseFileTree, parseFileArray } from '../../helpers/utils'
import { fetchRepoTree } from '../../actions/repoActions'
import FileIcon from '../svg/FileIcon'
import FolderIcon from '../svg/FolderIcon'
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

@connect(mapStateToProps, mapDispatchToProps)
export default class FileManager extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  componentWillMount() {
    const { fetchRepoTree, currentBranch } = this.props
    fetchRepoTree(currentBranch)
  }

  handleFileClick (file) {
    console.log(file)
    this.setState({ selectedFile: file.path })
    this.props.fileCallback(file.path)
  }

  handleFolderClick (folderName) {
    console.log(folderName)
    this.props.folderCallback(folderName)
  }

  render() {
    const { treeMeta } = this.props
    const records = treeMeta && parseFileTree(treeMeta)

    if (!records) {
      return (<div className='loading' style={{height: '400px'}} />)
    }

    return (
      <NestedFileTreeView
        selectedFilePath={this.state.selectedFile}
        fileTemplate={CustomFile}
        folderTemplate={CustomFolder}
        fileClickHandler={::this.handleFileClick}
        folderClickHandler={::this.handleFolderClick}
        directory={records} />
    )
  }
}

function mapStateToProps(state) {

  return {
    currentBranch: state.repo.get('currentBranch'),
    treeMeta: state.repo.get('treeMeta')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    fetchRepoTree
  }, dispatch)
}
