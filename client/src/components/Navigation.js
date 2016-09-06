import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import { fetchFileContent, createEmptyFile } from '../actions/editorActions'


@connect(mapStateToProps, mapDispatchToProps)
export default class Navigation extends Component {
  constructor() {
    super()
    this.state = { selectedItemIndex: undefined }
  }

  navigate(i) {
    const { fetchFileContent, filesMeta } = this.props

    fetchFileContent(filesMeta[i].path, i)
    this.setState({ selectedItemIndex: i })
  }

  createNew() {
    this.props.createEmptyFile()
  }

  render() {
    const { filesMeta } = this.props
    const { selectedItemIndex } = this.state
    console.log(filesMeta)
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
    filesMeta: state.repo.get('filesMeta')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ fetchFileContent, createEmptyFile }, dispatch)
}
