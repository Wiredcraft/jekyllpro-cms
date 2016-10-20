import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { selectCollectionFile, updateFile, deleteFile, addNewFile, replaceFile, updatingEditor } from '../actions/editorActions'
import { toRoute } from '../actions/routeActions'
import { collectionFileRemoved, collectionFileAdded, collectionFileUpdated,
  fileAdded, fileRemoved, fileReplaced } from '../actions/repoActions'

import ContentEditor from './Editor/ContentEditor'
import FileEditor from './Editor/FileEditor'
import FileUploader from './Editor/FileUploader'

class Editor extends Component {
  constructor() {
    super()
  }

  render() {
    const { mode, params, schemas, location } = this.props

    if (schemas && (mode === 'collection') && params.splat) {
      return (<ContentEditor {...this.props} />)
    }
    if ((mode === 'files' || params.collectionType === 'files') && params.splat) {
      return <FileEditor {...this.props} />
    }
    if (location.query && location.query['upload']) {
      return <FileUploader {...this.props} />
    }

    return <section id='content' />
  }
}

function mapStateToProps(state, { params:
  { collectionType, branch, splat: path } }) {

  return {
    currentBranch: state.repo.get('currentBranch'),
    repoName: state.repo.get('repoName'),
    schemas: state.repo.get('schemas'),
    collections: state.repo.get('collections'),
    selectedCollectionFile: state.editor.get('selectedCollectionFile'),
    mode: state.editor.get('mode'),
    editorUpdating: state.editor.get('loading')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    toRoute,
    collectionFileRemoved,
    collectionFileAdded,
    collectionFileUpdated,
    fileAdded,
    fileRemoved,
    fileReplaced,
    updateFile,
    deleteFile,
    addNewFile,
    replaceFile,
    selectCollectionFile,
    updatingEditor
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
