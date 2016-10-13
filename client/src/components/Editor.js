import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { updateFile, deleteFile, addNewFile, replaceFile, fetchFileContent, createEmptyFile } from '../actions/editorActions'
import { toRoute } from '../actions/routeActions'
import { selectCollectionFile } from '../actions/repoActions'

import ContentEditor from './Editor/ContentEditor'

const defaultSchema = require('../schema')

// TODO: remove linePattern
class Editor extends Component {
  constructor() {
    super()
  }

  render() {
    const { mode, params, schemas } = this.props

    if (schemas && mode === 'collection') {
      return (<ContentEditor {...this.props} />)
    }
    return <section id='content' />
  }
}

function mapStateToProps(state, { params:
  { collectionType, branch, splat: path } }) {

  return {
    currentBranch: branch || 'master',
    selectedFolder: state.repo.get('selectedFolder'),
    schemas: state.repo.get('schemas'),
    collections: state.repo.get('collections'),
    filesMeta: state.repo.get('filesMeta'),
    pagesMeta: state.repo.get('pagesMeta'),
    selectedCollectionFile: state.repo.get('selectedCollectionFile'),
    mode: state.editor.get('mode'),
    content: state.editor.get('content'),
    targetFile: state.editor.get('targetFile'),
    newFileMode: state.editor.get('newFileMode'),
    editorUpdating: state.editor.get('loading')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    toRoute,
    updateFile,
    deleteFile,
    addNewFile,
    selectCollectionFile,
    replaceFile,
    fetchFileContent,
    createEmptyFile
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
