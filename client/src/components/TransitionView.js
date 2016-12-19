import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import { selectCollectionFile } from '../actions/editorActions'
import { replaceRoute } from '../actions/routeActions'

class TransitionView extends Component {
  componentWillReceiveProps(nextProps) {
    const { replaceRoute } = this.props
    const { repoOwner, repoName, branch, splat } = this.props.params

    if (branch && splat && nextProps.collections) {
      let type;
      let isCollectionFile = nextProps.collections.some(item => {
        if (item.path === splat) {
          type = item.collectionType
          selectCollectionFile(item)
          // break iteration
          return true
        }
        return false
      })
      if (isCollectionFile) {
        replaceRoute(`/${repoOwner}/${repoName}/${type}/${branch}/${splat}`)
      } else {
        replaceRoute(`/${repoOwner}/${repoName}/files/${branch}/${splat}`)
      }
    }
  }

  render() {
    return (
      <section id='content' className='full-screen'>
        Analysing, will redirect soon...
      </section>
    )
  }
}

function mapStateToProps(state) {
  return {collections: state.repo.get('collections')}
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ selectCollectionFile, replaceRoute }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TransitionView)
