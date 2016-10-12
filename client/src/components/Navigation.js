import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import { withRouter } from 'react-router'
import FileIcon from './svg/FileIcon'
import FolderIcon from './svg/FolderIcon'
import ContentSidebar from './Navigation/ContentSidebar'

import { fetchFileContent, createEmptyFile, changeEditorMode } from '../actions/editorActions'
import { fetchFilesMeta, fetchRepoIndex, selectCollectionFile } from '../actions/repoActions'
import { toRoute } from '../actions/routeActions'

class Navigation extends Component {
  constructor(props) {
    super(props)
    this.state = { selectedItem: props.params ? props.params.splat : undefined }
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props

    if (params.splat !== prevProps.params.splat) {
      this.setState({selectedItem: params.splat})
    }
  }

  navigateByPath(path) {
    const { fetchFileContent, currentBranch, selectedFolder, collectionType, toRoute } = this.props
    this.setState({ selectedItem: path})
    // Do not render editor if click on any media files
    if (selectedFolder === 'media') {
      return
    }

    let routingUrl = `/${collectionType || 'pages'}/${currentBranch}/${path}`
    fetchFileContent(currentBranch, path)
      .then(() =>{
        toRoute(routingUrl)
      })
  }

  createNew() {
    this.props.createEmptyFile()
    this.setState({selectedItem: null})
  }

  render() {

    return (
      <ContentSidebar {...this.props} />
    )
  }
}

function mapStateToProps(state, { params:
  { collectionType, branch, splat: path } }) {
  return {
    loading: state.repo.get('loading'),
    collections: state.repo.get('collections'),
    schemas: state.repo.get('schemas'),
    selectedFolder: state.repo.get('selectedFolder'),
    collectionType: collectionType || state.repo.get('collectionType'),
    filesMeta: state.repo.get('filesMeta'),
    pagesMeta: state.repo.get('pagesMeta'),
    currentBranch: branch || 'master'
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ fetchFileContent, createEmptyFile, fetchFilesMeta, fetchRepoIndex, toRoute, changeEditorMode, selectCollectionFile }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation)
