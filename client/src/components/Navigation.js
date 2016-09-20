import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import { fetchFileContent, createEmptyFile } from '../actions/editorActions'
import { fetchFilesMeta } from '../actions/repoActions'

@connect(mapStateToProps, mapDispatchToProps)
export default class Navigation extends Component {
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
    console.log(path)
    const { fetchFileContent, currentBranch} = this.props
    this.setState({ selectedItem: path})
    fetchFileContent(currentBranch, path)
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

function mapStateToProps(state) {
  return {
    loading: state.repo.get('loading'),
    selectedFolder: state.repo.get('selectedFolder'),
    filesMeta: state.repo.get('filesMeta'),
    currentBranch: state.repo.get('currentBranch')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ fetchFileContent, createEmptyFile, fetchFilesMeta }, dispatch)
}
