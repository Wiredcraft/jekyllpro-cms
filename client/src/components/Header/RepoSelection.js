import React, { Component } from 'react'
import { checkRepoAvailability } from '../../helpers/api'
let timeout = null

export default class RepoSelection extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      searching: false,
      searchResult: null,
      inputClassname: ''
    }
  }
  handleSearch (repoFullName) {
    let tmp = repoFullName.split('/')
    if (tmp.length < 2) {
      return
    }
    this.setState({ searching: true })
    checkRepoAvailability(tmp[0], tmp[1]).then(() => {
      this.setState({ searching: false, searchResult: { repoOwner: tmp[0], repoName: tmp[1] } })
    }).catch(() => {
      this.setState({ searching: false, searchResult: '' })

    })
  }

  handleChange (evt) {
    let s = evt.target.value
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(this.handleSearch.bind(this, s), 300)
  }

  handleClick (evt) {
    const { getAllBranch, resetRepoData, resetEditorData, toRoute, fetchRepoInfo } = this.props
    const { searchResult: { repoName, repoOwner } } = this.state
    Cookie.set('repoOwner', repoOwner, { expires: 100 })
    Cookie.set('repoName', repoName, { expires: 100 })
    this.setState({ loading: true })
    resetEditorData()
    resetRepoData()
    fetchRepoInfo().then(() => {
      this.setState({
        loading: false
      })
      getAllBranch()
      toRoute(`/${repoOwner}/${repoName}/`)
    })
    .catch(err => {
      Cookie.remove('repoOwner')
      Cookie.remove('repoName')
      this.setState({ loading: false })
    })
  }

  render () {
    const { searching, loading, inputClassname, searchResult } = this.state
    // const { afterOpen, onclose, isOpen, repoDetails } = this.props
    return (
      <div className="options">
        <header className="header">
          <span className={`search ${searching ? 'processing' : ''}`}>
            <input
              className="search"
              type="text"
              onChange={::this.handleChange}
              placeholder="Search repositories by name" />
            <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"></path>
            </svg>
          </span>
        </header>
        <div className="empty">e.g. "Wiredcraft/pipelines"</div>
        { (searchResult === '') && !searching && <div className='empty'>No match</div>}
        { searchResult && !searching &&(<a onClick={::this.handleClick}>
          <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
            <path strokeWidth='0.2' strokeLinejoin='round' d='M 9.99936,3.99807L 3.99936,3.99807C 2.89436,3.99807 2.00936,4.89406 2.00936,5.99807L 1.99936,17.9981C 1.99936,19.1021 2.89436,19.9981 3.99936,19.9981L 19.9994,19.9981C 21.1029,19.9981 21.9994,19.1021 21.9994,17.9981L 21.9994,7.99807C 21.9994,6.89406 21.1029,5.99807 19.9994,5.99807L 11.9994,5.99807L 9.99936,3.99807 Z '/>
          </svg>
          {searchResult.repoOwner}/{searchResult.repoName}
        </a>)}
      </div>
    )
  }
}
