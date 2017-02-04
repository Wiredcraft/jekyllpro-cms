import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { selectCollectionFile, updateFile, deleteFile, addNewFile, replaceFile, updatingEditor } from '../actions/editorActions'
import { toRoute } from '../actions/routeActions'
import { collectionFileRemoved, collectionFileAdded, collectionFileUpdated,
  fileAdded, fileRemoved, fileReplaced } from '../actions/repoActions'

import ContentEditor from './Editor/ContentEditor'
import NewEditor from './Editor/NewEditor'
import NotFound from './NotFound'
import NoSchema from './common/NoSchema'
import InvalidRepo from './common/InvalidRepo'

class Editor extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { mode, params, schemas, location, repoFullName } = this.props

    if (location.query && location.query.invalidRepo) {
      return (<InvalidRepo />)
    }

    if (location.query && location.query.noSchema === '1') {
      return (<NoSchema repoFullName={repoFullName} />)
    }

    if (location.query && location.query.fileNotFound) {
      return (<NotFound />)
    }

    if (schemas && params.splat) {
      return (params.splat === 'new') && (<NewEditor {...this.props} />) || (<ContentEditor {...this.props} />)
    }

    return (<section id='content' />)
  }
}

function mapStateToProps(state, { params:
  { repoOwner, repoName, collectionType, branch, splat: path } }) {

  return {
    currentBranch: state.repo.get('currentBranch'),
    repoFullName: `${repoOwner}/${repoName}`,
    config: state.repo.get('config'),
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
