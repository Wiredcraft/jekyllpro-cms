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
  listHooks
} from '../actions/repoActions'
import { resetEditorData } from '../actions/editorActions'
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
      activeView: props.params.collectionType === 'files' ? 'files' : 'content'
    }
  }

  componentWillMount() {
    const { repoOwner, repoName, collectionType, branch, splat: path } = this.props.params
    const { fetchRepoInfo, getAllBranch, listHooks, toRoute } = this.props
    const repoOwnerCk = Cookie.get('repoOwner')
    const repoNameCk = Cookie.get('repoName')
    // routing
    if (collectionType && branch) {
      this.setState({ selectedType: collectionType })
    }

    if (repoOwner && repoName) {
      Cookie.set('repoOwner', repoOwner, { expires: 100 })
      Cookie.set('repoName', repoName, { expires: 100 })

      fetchRepoInfo()
      .then(res => {
        getAllBranch()
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

  componentDidMount() {
    const { location: { pathname, query } } = this.props
    if (query && query.modal === 'repoSelection') {
      // this.setState({showRepoModal: true})
    } else if (query && query.modal === 'repoSettings') {
      // this.setState({showSettingModal: true})
    }
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props
    const { query } = this.props.location
    if (query && (query.filteredType !== this.state.selectedType)) {
      this.setState({ selectedType: query.filteredType })
    }
    if (params && (params.collectionType !== prevProps.params.collectionType)) {
      this.setState({ activeView: params.collectionType === 'files' ? 'files' : 'content' })
    }
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

  toFilesView() {
    const { currentBranch, toRoute } = this.props
    const repoLink = `${Cookie.get('repoOwner')}/${Cookie.get('repoName')}`

    toRoute(`/${repoLink}/files/${currentBranch}/`)
    this.setState({ activeView: 'files' })
  }

  toContentView() {
    const { toRoute } = this.props
    const repoLink = `${Cookie.get('repoOwner')}/${Cookie.get('repoName')}`
    toRoute(`/${repoLink}/`)    
    this.setState({ activeView: 'content' })
  }

  toPreview() {
    const { toRoute, params: { repoOwner, repoName, collectionType, branch, splat: filePath } } = this.props
    toRoute({
      pathname: `/${repoOwner}/${repoName}/${collectionType}/${branch || 'master' }/${filePath || ''}`,
      query: { viewing: 'site' }
    })
    this.setState({ activeView: 'preview' })  
  }

  render () {
    const { branches, currentBranch, avatar, userName, userUrl, isBranchPrivate, schemas,
    params: { repoOwner, repoName, collectionType, branch, splat: filePath} } = this.props
    const { selectedType, activeView } = this.state

    return (
      <header id='header'>
        <nav className='navigation'>
          <span className='repo menu'>
            <a className='item repo' >
              <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeWidth='0.2' strokeLinejoin='round' d='M 9.99936,3.99807L 3.99936,3.99807C 2.89436,3.99807 2.00936,4.89406 2.00936,5.99807L 1.99936,17.9981C 1.99936,19.1021 2.89436,19.9981 3.99936,19.9981L 19.9994,19.9981C 21.1029,19.9981 21.9994,19.1021 21.9994,17.9981L 21.9994,7.99807C 21.9994,6.89406 21.1029,5.99807 19.9994,5.99807L 11.9994,5.99807L 9.99936,3.99807 Z '/>
              </svg>
              {repoOwner}/{repoName}
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
              <a onClick={() => this.logout()}>Logout</a>
            </div>
          </span>
        </nav>
        <span className='logo menu'>
          <a className='item logo'>
            <img src={require('../assets/logo-small.svg')} alt='logo' />
          </a>
          <div className="options">
            <header className="header">
              <img src={require('../assets/logo.svg')} className="logo" alt="Jekyll+" />
              <small>v0.8.1 | MIT License</small>
            </header>
            <hr />
            <a href="https://github.com/Wiredcraft/jekyllplus" target="_blank">
              <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path>
              </svg>
              View on GitHub
            </a>
          </div>
        </span>
        <span className='menu content'>
          <a className={activeView === 'content' ? 'item active' : 'item'} onClick={::this.toContentView}>
            <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
              <path d='M 19,7L 9,7L 9,5L 19,5M 15,15L 9,15L 9,13L 15,13M 19,11L 9,11L 9,9L 19,9M 20,2L 8,2C 6.9,2 6,2.9 6,4L 6,16C 6,17.1 6.9,18 8,18L 20,18C 21.1,18 22,17.1 22,16L 22,4C 22,2.9 21.1,2 20,2 Z M 4,6L 2,6L 2,20C 2,21.1 2.9,22 4,22L 18,22L 18,20L 4,20L 4,6 Z '></path>
            </svg>
            Content
          </a>
          <div className='options'>
          {
            schemas && schemas.map((s, idx) => {
              return (
                <Link key={s.title}
                  to={`/${repoOwner}/${repoName}/?filteredType=${s.jekyll.id}`}
                  className={selectedType === s.jekyll.id ? 'selected' : ''} >
                  <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M 19,7L 9,7L 9,5L 19,5M 15,15L 9,15L 9,13L 15,13M 19,11L 9,11L 9,9L 19,9M 20,2L 8,2C 6.9,2 6,2.9 6,4L 6,16C 6,17.1 6.9,18 8,18L 20,18C 21.1,18 22,17.1 22,16L 22,4C 22,2.9 21.1,2 20,2 Z M 4,6L 2,6L 2,20C 2,21.1 2.9,22 4,22L 18,22L 18,20L 4,20L 4,6 Z '></path>
                  </svg>
                  {s.title}
                </Link>
              )
            })
          }
          </div>
        </span>

        <a className={activeView === 'files' ? 'item active' : 'item'} onClick={::this.toFilesView}>
          <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
            <path d='M3,3H9V7H3V3M15,10H21V14H15V10M15,17H21V21H15V17M13,13H7V18H13V20H7L5,20V9H7V11H13V13Z' />
          </svg>
          Files
        </a>

        <a className={ filePath ? (activeView === 'preview' ? 'preview item active' : 'preview item') : 'preview item disabled' }
          onClick={::this.toPreview}>
          <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"></path>
          </svg>
          Preview
        </a>
        <span className="publish menu">
          <a className="item">
            <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"></path>
            </svg>
            Publish
          </a>
          <div className="options">
            <a href="https://jekyllpro.com" target="_blank">
              <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path>
              </svg>
              JekyllPro
            </a>
          </div>
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
    repoDetails: state.repo.get('repoDetails'),
    hasIndexHook: state.repo.get('hasIndexHook')
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
    listHooks,
    fetchRepoInfo
  }, dispatch)
}
