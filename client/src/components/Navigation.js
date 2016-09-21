import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import { withRouter } from 'react-router'

import { fetchFileContent, createEmptyFile } from '../actions/editorActions'
import { fetchFilesMeta } from '../actions/repoActions'


class Navigation extends Component {
  constructor() {
    super()
    this.state = { selectedItem: undefined }
  }

  componentDidUpdate(prevProps) {
    const { currentBranch, selectedFolder } = this.props

    // reset highlighted item when switching branch or folders
    if ((currentBranch !== prevProps.currentBranch) || (selectedFolder !== prevProps.selectedFolder)) {
      this.setState({selectedItem: null})
    }
  }

  navigateByPath(path) {
    const { fetchFileContent, currentBranch, selectedFolder, collectionType } = this.props
    this.setState({ selectedItem: path})
    // Do not render editor if click on any media files
    if (selectedFolder === 'media') {
      return
    }

    let routingUrl = `/${collectionType || 'pages'}/${currentBranch}/${path}`
    fetchFileContent(currentBranch, path, routingUrl)
  }

  createNew() {
    this.props.createEmptyFile()
    this.setState({selectedItem: null})
  }

  render() {
    const { filesMeta, loading, selectedFolder } = this.props
    const { selectedItem } = this.state

    return (
      <nav id='navigation'>
        <header className='header'>
          <div className='controls'>
            <button className='button primary' onClick={::this.createNew}>Create</button>
          </div>
          <input type='text' className='search' placeholder='Filter by name'/>
        </header>
        <section className='body'>
          {
            !loading && filesMeta && filesMeta.map((node, i) => {
              if (node.children) {
                return (
                  <div key={node.name+i}>
                    <a className='folder'>{ node.name } /</a>
                    {
                      node.children.map((node, n) => {
                        return (
                          <a className={selectedItem === node.path ? 'active child': 'child'}
                            key={node.name+n+'child'}
                            onClick={() => this.navigateByPath(node.path)}>
                            <h2>|_ { node.name }</h2>
                          </a>
                        )
                      })
                    }
                  </div>
                )
              }
              return (
                <a className={selectedItem === node.path ? 'active': ''}
                  key={node.name+i}
                  onClick={() => this.navigateByPath(node.path)}>
                  <h2>{ node.name }</h2>
                </a>
              )
            })
          }
        </section>
      </nav>
    )
  }
}

function mapStateToProps(state, { params:
  { collectionType, branch, splat: path } }) {
  return {
    loading: state.repo.get('loading'),
    selectedFolder: state.repo.get('selectedFolder'),
    collectionType: state.repo.get('collectionType'),
    schema: state.repo.get('schema'),
    filesMeta: state.repo.get('filesMeta'),
    pagesMeta: state.repo.get('pagesMeta'),
    currentBranch: branch || 'master'
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ fetchFileContent, createEmptyFile, fetchFilesMeta }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation)
