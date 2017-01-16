import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Cookie from 'js-cookie'
import MagnifierIcon from './svg/MagnifierIcon'
import RepoIcon from './svg/RepoIcon'
import { checkRepoAvailability } from '../helpers/api'
import { toRoute } from '../actions/routeActions'
import { resetRepoData } from '../actions/repoActions'

let timeout = null

@connect(mapStateToProps, mapDispatchToProps)
export default class SelectRepo extends Component {
  constructor(props) {
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
    checkRepoAvailability(tmp[0], tmp[1]).then(() => {
      this.setState({
        searching: false,
        searchResult: { repoOwner: tmp[0], repoName: tmp[1] }
      })
    }).catch(() => {
      this.setState({
        searching: false,
        searchResult: ''
      })

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
    const { toRoute, resetRepoData, repoDetails } = this.props
    const { searchResult: { repoName, repoOwner } } = this.state
    Cookie.set('repoOwner', repoOwner, { expires: 100 })
    Cookie.set('repoName', repoName, { expires: 100 })

    if (repoDetails) {
      resetRepoData()
    }
    toRoute(`/${repoOwner}/${repoName}/`)
  }

  render () {
    const { searching, searchResult } = this.state
    return (
      <div className='box'>
        <section className='card'>
          <h2>Select a repository</h2>
          <span className={`search ${searching ? 'processing' : ''}`}>
            <input
              className="search"
              type="text"
              onChange={::this.handleChange}
              placeholder="Search repositories by name" />
            <MagnifierIcon />
          </span>
          { (searchResult === null || searching) && <div className="empty">e.g. "Wiredcraft/pipelines"</div>}
          { (searchResult === '') && !searching && <div className='empty'>No match</div>}
          { searchResult && !searching &&(<a className='repo' onClick={::this.handleClick}>
            <RepoIcon />
            {searchResult.repoOwner}/{searchResult.repoName}
          </a>)}
        </section>
      </div>
    )
  }
}

function mapStateToProps(state, { params:
  { collectionType, branch, splat: path } }) {

  return {
    repoDetails: state.repo.get('repoDetails')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    resetRepoData,
    toRoute
  }, dispatch)
}