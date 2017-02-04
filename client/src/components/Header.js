import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import Cookie from 'js-cookie'

import {
  getAllBranch,
  checkoutBranch,
  getCurrentBranchUpdateTime,
  fetchRepoInfo,
  resetRepoData,
  fetchRepoIndex,
  resetUpdateSignal
} from '../actions/repoActions'
import { resetEditorData, selectCollectionFile } from '../actions/editorActions'
import { logout } from '../actions/userActions'
import { toRoute } from '../actions/routeActions'

import ExternalLinkIcon from './svg/ExternalLinkIcon'
import BranchIcon from './svg/BranchIcon'
import LogoutIcon from './svg/LogoutIcon'
import RepoSelection from './Header/RepoSelection'
import notify from './common/Notify'
import JekyllProStatus from './Header/JekyllProStatus'

@connect(mapStateToProps, mapDispatchToProps)
export default class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedType: undefined,
    }
  }

  componentWillMount() {
    this.loadBasicRepoData()
  }

  componentDidUpdate(prevProps, prevState) {
    const { params: { repoOwner, repoName } } = this.props
    const { repoOwner: prevRepoOwner, repoName: prevRepoName } = prevProps.params
    // happens when user select different repository
    if (prevRepoOwner && prevRepoName &&
      (repoOwner !== prevRepoOwner) || (repoName !== prevRepoName)) {
      this.loadBasicRepoData()
    }
  }

  componentWillReceiveProps(nextProps) {
    const { currentBranchUpdatedAt, indexUpdatedAt, currentBranch, fetchRepoIndex } = nextProps

    // check if index is out of sync
    if (currentBranchUpdatedAt && indexUpdatedAt &&
      (currentBranchUpdatedAt !== this.props.currentBranchUpdatedAt) &&
      (Date.parse(indexUpdatedAt) < Date.parse(currentBranchUpdatedAt))) {
      
      notify('warning', 'Rebuilding index data for repository, this may take a few minutes', '', 5000)

      fetchRepoIndex({ branch: currentBranch, refresh: true })
        .then(data => {
          this.checkIfExistingFile(data)
        })
        .catch(err => {
          this.indexDataErrorHandler(err)
        })
    }
  }

  loadBasicRepoData() {
    const repoOwnerCk = Cookie.get('repoOwner')
    const repoNameCk = Cookie.get('repoName')
    const { fetchRepoInfo, getAllBranch, toRoute, params: { repoOwner, repoName } } = this.props

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
    const { fetchRepoIndex, getCurrentBranchUpdateTime, currentBranch } = this.props

    fetchRepoIndex({ branch: currentBranch })
    .then((indexData) => {
      return this.checkIfHasSchema(indexData)
    })
    .then((data) => {
      getCurrentBranchUpdateTime(currentBranch)

      this.checkIfExistingFile(data)
    })
    .catch(err => {
      this.indexDataErrorHandler(err)
    })
  }

  checkIfHasSchema(indexData) {
    const { toRoute, location, fetchRepoIndex, currentBranch } = this.props
    // this repo branch might have legacy index data even it does not have schemas,
    // in this case, do a refresh index build,
    // if it still does not have schemas, the request will return error.
    if (!indexData.schemas || !indexData.schemas.length) {
      return fetchRepoIndex({ branch: currentBranch, refresh: true })
    }
    return Promise.resolve(indexData)
  }

  checkIfExistingFile(indexData) {
    const { params, toRoute, location, selectCollectionFile } = this.props

    if (params.splat && (params.splat !== 'new')) {
      let fileMatched = indexData.collections.some(item => {
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
  }

  indexDataErrorHandler(err) {
    const { toRoute, location } = this.props
    const customError = JSON.parse(err.response.text)
    if (err.status === 404) {
      if (customError.errorCode === 4042) {
        return toRoute({
          pathname: location.pathname,
          query: { noSchema: 1 }          
        })
      }
      toRoute({
        pathname: location.pathname,
        query: { invalidRepo: 1 }
      })        
    }
  }

  handleBranchChange(newBranch) {
    const {checkoutBranch, toRoute} = this.props
    const { repoOwner, repoName } = this.props.params
    checkoutBranch(newBranch)
    .then(() => {
      this.fetchLatestIndex()
    })
    toRoute(`/${repoOwner}/${repoName}/`)
  }

  logout () {
    this.props.logout()
  }

  render () {
    const { branches, currentBranch, avatar, userName, userUrl, repoDetails,
      repoUpdateSignal, resetUpdateSignal, params: { repoOwner, repoName } } = this.props

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
        <JekyllProStatus
          {...{ repoOwner, repoName, currentBranch,
            repoUpdateSignal, resetUpdateSignal }} />
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
    repoDetails: state.repo.get('repoDetails'),
    repoUpdateSignal: state.repo.get('repoUpdateSignal'),
    currentBranchUpdatedAt: state.repo.get('currentBranchUpdatedAt'),
    indexUpdatedAt: state.repo.get('indexUpdatedAt')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    getAllBranch,
    checkoutBranch,
    getCurrentBranchUpdateTime,
    logout,
    resetRepoData,
    resetEditorData,
    toRoute,
    selectCollectionFile,
    fetchRepoInfo,
    fetchRepoIndex,
    resetUpdateSignal
  }, dispatch)
}
