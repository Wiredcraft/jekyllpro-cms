import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import Cookie from 'js-cookie'

import {
  getAllBranch,
  checkoutBranch,
  fetchRepoInfo,
  resetRepoData,
  fetchRepoIndex
} from '../actions/repoActions'
import { resetEditorData, selectCollectionFile } from '../actions/editorActions'
import { logout } from '../actions/userActions'
import { toRoute } from '../actions/routeActions'

import ExternalLinkIcon from './svg/ExternalLinkIcon'
import BranchIcon from './svg/BranchIcon'
import LogoutIcon from './svg/LogoutIcon'
import RepoSelection from './Header/RepoSelection'

@connect(mapStateToProps, mapDispatchToProps)
export default class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedType: undefined,
    }
  }

  componentWillMount() {
    const { repoOwner, repoName, collectionType, branch, splat: path } = this.props.params
    const { fetchRepoInfo, getAllBranch, listHooks, toRoute } = this.props
    const repoOwnerCk = Cookie.get('repoOwner')
    const repoNameCk = Cookie.get('repoName')

    if (repoOwner && repoName) {
      Cookie.set('repoOwner', repoOwner, { expires: 100 })
      Cookie.set('repoName', repoName, { expires: 100 })

      fetchRepoInfo()
      .then(res => {
        getAllBranch()
        this.fetchLatestIndex()
      })
      .catch(err => {
        Cookie.remove('repoOwner')
        Cookie.remove('repoName')
        toRoute({ pathname: '/select', query: { reset: 1 } })
      })
    } else if (repoOwnerCk && repoNameCk) {
      fetchRepoInfo()
      .then(res => {
        toRoute({
          pathname: `/${repoOwnerCk}/${repoNameCk}/`
        })      
        getAllBranch()
        this.fetchLatestIndex()
      })
      .catch(err => {
        Cookie.remove('repoOwner')
        Cookie.remove('repoName')
        toRoute({ pathname: '/select', query: { reset: 1 } })
      })

    } else {
      toRoute({ pathname: '/select', query: { reset: 1 } })
    }
  }

  fetchLatestIndex() {
    const { fetchRepoIndex, params, toRoute, location,
      selectCollectionFile, currentBranch, query, repoDetails } = this.props

    fetchRepoIndex({ branch: currentBranch })
    .then((indexData) => {
      // check if index is out of sync
      if (Date.parse(indexData.updated) < Date.parse(repoDetails.updatedAt)) {

        return fetchRepoIndex({ branch: currentBranch, refresh: true })
          .then((newIndexData) => {
            return newIndexData
          })
      }
      // check if this repo has schemas
      if (!indexData.schemas || !indexData.schemas.length) {
        return toRoute({
          pathname: location.pathname,
          query: { invalidRepo: 1 }
        })
      }
      return indexData
    })
    .then((data) => {
      if (params.splat && (params.splat !== 'new')) {
        let fileMatched = data.collections.some(item => {
          if (item.path === params.splat) {
            selectCollectionFile(item)
            // break iteration
            return true
          }
          return false
        })

        if (!fileMatched) {
          toRoute({
            pathname: location.pathname,
            query: { fileNotFound: 1 }            
          })
        }
      }
    })
    .catch(err => {
      if (err.status === 404) {
        toRoute({
          pathname: location.pathname,
          query: { invalidRepo: 1 }
        })        
      }
    })
  }

  handleBranchChange(newBranch) {
    const {checkoutBranch, toRoute} = this.props
    const { repoOwner, repoName } = this.props.params
    checkoutBranch(newBranch)
    toRoute(`/${repoOwner}/${repoName}/`)
  }

  logout () {
    this.props.logout()
  }

  render () {
    const { branches, currentBranch, avatar, userName, userUrl, schemas, repoDetails,
    params: { repoOwner, repoName, collectionType, branch, splat: filePath} } = this.props

    let previewLink = `http://${currentBranch || 'master'}.`
      + (repoName && repoName.split('.').join('-') || 'demo')
      + `.${repoOwner}.jekyllpro.com`

    return (
      <header id='header'>
        <span className='menu user'>
          <a className='item'><img src={avatar} /></a>
          <div className="options">
            <a href={userUrl} target="_blank">
              <ExternalLinkIcon />
              {userName}
            </a>
            <hr />
            <a onClick={() => this.logout()}>
              <LogoutIcon />
              Logout
            </a>
          </div>
        </span>
        <span className='repo menu'>
          <a className='item' >
            {repoDetails && <img src={repoDetails.ownerAvatar} />}
            {repoName}
          </a>
          <RepoSelection {...this.props}>
            <a href={`https://github.com/${repoOwner}/${repoName}`} target='_blank'>
              <ExternalLinkIcon />{repoOwner}/{repoName}
            </a>
            <hr />
          </RepoSelection>
        </span>
        <span className='branch menu'>
          <a className='item'>
            <BranchIcon />
            {currentBranch}
          </a>
          { branches && (
            <div className='options'>
              {branches && branches.map((b) => {
                return (
                  <a className={b.name === currentBranch ? 'selected' : ''}
                    onClick={this.handleBranchChange.bind(this, b.name)}
                    key={b.name}>
                    <BranchIcon />
                    <span>{ b.name }</span>
                  </a>
                )
              })}
            </div>
          )}
        </span>

        <span className='website menu'>
          <a className="view item tooltip-bottom" href={previewLink}>
            <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"></path>
            </svg>
            Website
          </a>
        </span>
      </header>
    )
  }
}

function mapStateToProps(state, { params:
  { collectionType, branch, splat: path } }) {

  return {
    currentBranch: state.repo.get('currentBranch'),
    avatar: state.user.get('avatar'),
    schemas: state.repo.get('schemas'),
    userName: state.user.get('userName'),
    userUrl: state.user.get('userUrl'),
    branches: state.repo.get('branches'),
    repoDetails: state.repo.get('repoDetails')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    getAllBranch,
    checkoutBranch,
    logout,
    resetRepoData,
    resetEditorData,
    toRoute,
    selectCollectionFile,
    fetchRepoInfo,
    fetchRepoIndex
  }, dispatch)
}
