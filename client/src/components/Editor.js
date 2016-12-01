import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { selectCollectionFile, updateFile, deleteFile, addNewFile, replaceFile, updatingEditor } from '../actions/editorActions'
import { toRoute } from '../actions/routeActions'
import { collectionFileRemoved, collectionFileAdded, collectionFileUpdated,
  fileAdded, fileRemoved, fileReplaced } from '../actions/repoActions'

import ContentEditor from './Editor/ContentEditor'
import FileEditor from './Editor/FileEditor'

class Editor extends Component {
  constructor() {
    super()
  }

  render() {
    const { mode, params, schemas, location } = this.props

    if (location.query && location.query.invalidRepo === '1') {
      return (<section id='content'>
        <div className='empty'>
          <h2>Something went wrong...</h2>
          <p>Jekyll+ need schema files defining the content types.</p>
          <a className='button primary' href='https://github.com/Wiredcraft/jekyllplus/wiki' target='_blank'>Read more about it...</a>
        </div>
      </section>)
    }

    if (schemas && (mode === 'collection') && params.splat) {
      return (<ContentEditor {...this.props} />)
    }
    if (mode === 'files' || params.collectionType === 'files') {
      return <FileEditor {...this.props} />
    }

    return (<section id='content'>
      <div className='empty'>
        <h2>No content selected</h2>
        <p>You can select an entry using the sidebar.</p>
      </div>
    </section>)
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
