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
      <nav id='sidebar'>
        <header className='header'>
          <span className='controls'>
            <button className='button primary icon tooltip-bottom'>
              <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
                <path d='M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z' />
              </svg>
              <span>Upload</span>
            </button>

            <button className='button primary create'>Create</button>
          </span>
          <span className='search'>
            <input type='text' placeholder='Filter by name'/>
            <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
              <path d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' />
            </svg>
          </span>
        </header>

        <span className='body tree'>
          <ul>
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
        </span>
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
