import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import ContentSidebar from './Navigation/ContentSidebar'
import FilesSidebar from './Navigation/FilesSidebar'

import { changeEditorMode, selectCollectionFile } from '../actions/editorActions'
import { fetchRepoIndex, fetchRepoTree } from '../actions/repoActions'
import { toRoute, replaceRoute } from '../actions/routeActions'

class Navigation extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { collectionType } = this.props.params

    if (collectionType === 'files') {
      return (<FilesSidebar {...this.props} />)
    }
    return (
      <ContentSidebar {...this.props} />
    )
  }
}

function mapStateToProps(state, {
  params: { collectionType, branch, splat: path },
  location: { pathname, query } }) {
  return {
    pathname: pathname,
    query: query,
    loading: state.repo.get('loading'),
    collections: state.repo.get('collections'),
    schemas: state.repo.get('schemas'),
    treeMeta: state.repo.get('treeMeta'),
    currentBranch: state.repo.get('currentBranch')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ fetchRepoIndex, toRoute, replaceRoute, changeEditorMode,
    selectCollectionFile, fetchRepoTree }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation)
