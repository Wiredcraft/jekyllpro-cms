import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import { fetchDefaultSchema, fetchFileContent, createEmptyFile } from '../actions/editorActions'
import { fetchFilesMeta } from '../actions/repoActions'

@connect(mapStateToProps, mapDispatchToProps)
export default class Navigation extends Component {
  constructor() {
    super()
    this.state = { selectedItemIndex: undefined }
  }

  componentWillMount() {
    const { fetchDefaultSchema, fetchFilesMeta, currentBranch } = this.props
    fetchDefaultSchema(currentBranch)
    fetchFilesMeta(currentBranch)
  }

  navigate(i) {
    const { fetchFileContent, filesMeta, currentBranch } = this.props

    fetchFileContent(currentBranch, filesMeta[i].path, i)
    this.setState({ selectedItemIndex: i })
  }

  createNew() {
    this.props.createEmptyFile()
    this.setState({selectedItemIndex: null})
  }

  render() {
    const { filesMeta } = this.props
    const { selectedItemIndex } = this.state

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
            filesMeta && filesMeta.map((d, i) => (
              <a
                className={selectedItemIndex === i ? 'active' : ''}
                key={d.path}
                onClick={() => this.navigate(i)}
              >
                <h2>{ d.name }</h2>
              </a>
            ))
          }
        </section>
      </nav>
    )
  }
}

function mapStateToProps(state) {
  return {
    filesMeta: state.repo.get('filesMeta'),
    currentBranch: state.repo.get('currentBranch')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ fetchDefaultSchema, fetchFileContent, createEmptyFile, fetchFilesMeta }, dispatch)
}
