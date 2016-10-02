import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import { withRouter } from 'react-router'
import FileIcon from './svg/FileIcon'
import FolderIcon from './svg/FolderIcon'

import { fetchFileContent, createEmptyFile } from '../actions/editorActions'
import { fetchFilesMeta } from '../actions/repoActions'
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
    const { filesMeta, loading, selectedFolder, collectionType } = this.props
    const { selectedItem } = this.state

    return (
      <nav id='navigation'>
        {
          collectionType && collectionType !=='media' && (
            <header className='header'>
              <div className='controls'>
                <button className='button primary' onClick={::this.createNew}>Create</button>
              </div>
              <input type='text' className='search' placeholder='Filter by name'/>
            </header>
          )
        }
        <section className='body'>
          <ul className='tree'>
          {
            !loading && collectionType !=='media' && filesMeta && filesMeta.map((node, i) => {
              if (node.children) {
                return (
                  <li key={node.name+i}>
                    <a>
                      <FolderIcon />
                      { node.name }
                    </a>
                    <ul>
                      {
                        node.children.map((node, n) => {
                          return (
                            <li key={node.name+n+'child'}
                              onClick={() => this.navigateByPath(node.path)}>
                              <a className={selectedItem === node.path ? 'active': ''}>
                                <FileIcon />
                                { node.name }
                              </a>
                            </li>
                          )
                        })
                      }
                    </ul>
                  </li>
                )
              }
              return (
                <li
                  key={node.name+i}
                  onClick={() => this.navigateByPath(node.path)}>
                  <a className={selectedItem === node.path ? 'active': ''}>
                    <FileIcon />
                    <span>{ node.name }</span>
                  </a>
                </li>
              )
            })
          }
          </ul>
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
    collectionType: collectionType || state.repo.get('collectionType'),
    schema: state.repo.get('schema'),
    filesMeta: state.repo.get('filesMeta'),
    pagesMeta: state.repo.get('pagesMeta'),
    currentBranch: branch || 'master'
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ fetchFileContent, createEmptyFile, fetchFilesMeta, toRoute }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation)
