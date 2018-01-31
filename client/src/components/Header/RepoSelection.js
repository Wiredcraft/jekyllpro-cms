import React, { Component } from 'react'
import { checkRepoAvailability } from '../../helpers/api'
import MagnifierIcon from '../svg/MagnifierIcon'
import RepoIcon from '../svg/RepoIcon'
let timeout = null

export default class RepoSelection extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searching: false,
      searchResult: null
    }
  }
  handleSearch (repoFullName) {
    let tmp = repoFullName.split('/')
    if (tmp.length < 2 || !tmp[1]) {
      return
    }
    this.setState({ searching: true })
    checkRepoAvailability(tmp[0], tmp[1])
      .then(() => {
        this.setState({
          searching: false,
          searchResult: { repoOwner: tmp[0], repoName: tmp[1] }
        })
      })
      .catch(() => {
        this.setState({ searching: false, searchResult: '' })
      })
  }

  handleChange (evt) {
    let s = evt.target.value
    if (!s) {
      this.setState({ searchResult: null })
    }
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(this.handleSearch.bind(this, s), 300)
  }

  handleClick (evt) {
    const { resetRepoData, resetEditorData, toRoute } = this.props
    const { searchResult: { repoName, repoOwner } } = this.state

    resetEditorData()
    resetRepoData()
    toRoute(`/${repoOwner}/${repoName}/`)
  }

  render () {
    const { searching, searchResult } = this.state

    return (
      <div className='options'>
        {this.props.children}
        <header className='header'>
          <span className={`search ${searching ? 'processing' : ''}`}>
            <input
              className='search'
              type='text'
              onChange={::this.handleChange}
              placeholder='Search by name'
            />
            <MagnifierIcon />
          </span>
        </header>
        {(searchResult === null || searching) &&
          <div className='empty'>e.g. "Wiredcraft/pipelines"</div>}
        {searchResult === '' &&
          !searching &&
          <div className='empty'>No match</div>}
        {searchResult &&
          !searching &&
          <a onClick={::this.handleClick}>
            <RepoIcon />
            {searchResult.repoOwner}/{searchResult.repoName}
          </a>}
      </div>
    )
  }
}
