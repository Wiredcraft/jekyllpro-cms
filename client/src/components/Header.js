import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import { Link } from 'react-router'
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

import RepoIcon from './svg/RepoIcon'
import BranchIcon from './svg/BranchIcon'
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
              <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path>
              </svg>
              {userName}
            </a>
            <hr />
            <a onClick={() => this.logout()}>
              <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
              </svg>
              Logout
            </a>
          </div>
        </span>
        <span className='repo menu'>
          <a className='item' >
            {repoDetails && <img src={repoDetails.ownerAvatar} />}
            {repoName}
          </a>
          <RepoSelection {...this.props} />
        </span>
        <span className='branch menu'>
          <a className='item'>
            <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
              <path strokeWidth='0.2' strokeLinejoin='round' d='M 13,14C 9.64431,14 8.54075,15.3513 8.17783,16.24C 9.2492,16.6979 10,17.7612 10,19C 10,20.6569 8.65686,22 7,22C 5.34315,22 4,20.6569 4,19C 4,17.6938 4.83481,16.5825 6,16.1707L 6,7.8293C 4.83481,7.41746 4,6.30622 4,5C 4,3.34315 5.34315,2.00001 7,2.00001C 8.65685,2.00001 10,3.34315 10,5C 10,6.30622 9.16519,7.41746 8,7.8293L 8,13.1221C 8.8845,12.4701 10.1602,12 12,12C 14.6714,12 15.5587,10.662 15.8534,9.77309C 14.7654,9.32274 14,8.25076 14,7C 14,5.34315 15.3431,4 17,4C 18.6569,4 20,5.34315 20,7C 20,8.34026 19.1211,9.47524 17.9082,9.86006C 17.6521,11.2898 16.6812,14 13,14 Z M 7,18C 6.44771,18 6,18.4477 6,19C 6,19.5523 6.44771,20 7,20C 7.55228,20 8,19.5523 8,19C 8,18.4477 7.55228,18 7,18 Z M 7,4.00001C 6.44771,4.00001 6,4.44772 6,5.00001C 6,5.55229 6.44771,6.00001 7,6.00001C 7.55228,6.00001 8,5.55229 8,5.00001C 8,4.44772 7.55228,4.00001 7,4.00001 Z M 17,6.00001C 16.4477,6.00001 16,6.44772 16,7C 16,7.55229 16.4477,8 17,8C 17.5523,8 18,7.55229 18,7C 18,6.44772 17.5523,6.00001 17,6.00001 Z '/>
            </svg>
              {currentBranch}
          </a>
          { branches && (
            <div className='options'>
              {branches && branches.map((b) => {
                return (
                  <a className={b.name === currentBranch ? 'selected' : ''}
                    onClick={this.handleBranchChange.bind(this, b.name)}
                    key={b.name}>
                    <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
                      <path strokeWidth='0.2' strokeLinejoin='round' d='M 13,14C 9.64431,14 8.54075,15.3513 8.17783,16.24C 9.2492,16.6979 10,17.7612 10,19C 10,20.6569 8.65686,22 7,22C 5.34315,22 4,20.6569 4,19C 4,17.6938 4.83481,16.5825 6,16.1707L 6,7.8293C 4.83481,7.41746 4,6.30622 4,5C 4,3.34315 5.34315,2.00001 7,2.00001C 8.65685,2.00001 10,3.34315 10,5C 10,6.30622 9.16519,7.41746 8,7.8293L 8,13.1221C 8.8845,12.4701 10.1602,12 12,12C 14.6714,12 15.5587,10.662 15.8534,9.77309C 14.7654,9.32274 14,8.25076 14,7C 14,5.34315 15.3431,4 17,4C 18.6569,4 20,5.34315 20,7C 20,8.34026 19.1211,9.47524 17.9082,9.86006C 17.6521,11.2898 16.6812,14 13,14 Z M 7,18C 6.44771,18 6,18.4477 6,19C 6,19.5523 6.44771,20 7,20C 7.55228,20 8,19.5523 8,19C 8,18.4477 7.55228,18 7,18 Z M 7,4.00001C 6.44771,4.00001 6,4.44772 6,5.00001C 6,5.55229 6.44771,6.00001 7,6.00001C 7.55228,6.00001 8,5.55229 8,5.00001C 8,4.44772 7.55228,4.00001 7,4.00001 Z M 17,6.00001C 16.4477,6.00001 16,6.44772 16,7C 16,7.55229 16.4477,8 17,8C 17.5523,8 18,7.55229 18,7C 18,6.44772 17.5523,6.00001 17,6.00001 Z '/>
                    </svg>
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
