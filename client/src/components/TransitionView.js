import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import { changeEditorMode, selectCollectionFile } from '../actions/editorActions'
import { fetchRepoIndex } from '../actions/repoActions'
import { replaceRoute } from '../actions/routeActions'

class TransitionView extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { changeEditorMode, selectCollectionFile, fetchRepoIndex, replaceRoute } = this.props
    const { repoOwner, repoName, branch, splat } = this.props.params

    if (branch && splat) {
      fetchRepoIndex({ branch: branch })
      .then((indexData) => {
        let type;
        let isCollectionFile = indexData.collections.some(item => {
          if (item.path === splat) {
            type = item.collectionType
            selectCollectionFile(item)
            changeEditorMode('collection')
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
      })
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
  return {}
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ changeEditorMode, selectCollectionFile, fetchRepoIndex, replaceRoute }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TransitionView)
