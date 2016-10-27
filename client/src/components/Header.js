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
import Modal from 'react-modal'
import ModalCustomStyle from './Modal'
import RepoSelectionModal from './Modal/RepoSelectionModal'
import SettingModal from './Modal/SettingModal'

@connect(mapStateToProps, mapDispatchToProps)
export default class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showProfileModal: false,
      showRepoModal: false,
      showSettingModal: false,
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
        this.setState({ showRepoModal: true })
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
        this.setState({ showRepoModal: true })
      })

    } else {
      this.setState({showRepoModal: true})
      
    }
  }

  componentDidMount() {
    const { location: { pathname, query } } = this.props
    if (query && query.modal === 'repoSelection') {
      this.setState({showRepoModal: true})
    } else if (query && query.modal === 'repoSettings') {
      this.setState({showSettingModal: true})
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

  onCloseRepoModal () {
    this.setState({showRepoModal: false})
  }

  onCloseSettingModal () {
    this.setState({showSettingModal: false})
  }

  afterOpenModal() {
    document.body.classList.add('ReactModal__Body--open')
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

  render () {
    const { branches, currentBranch, avatar, userName, isBranchPrivate, schemas,
    params: { repoOwner, repoName, collectionType, branch, splat: filePath} } = this.props
    const { selectedType, activeView } = this.state

    return (
      <header id='header'>
        <nav className='navigation'>
          <a className='item repo' onClick={evt => {this.setState({showRepoModal: true})}}>
            <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
              <path strokeWidth='0.2' strokeLinejoin='round' d='M 9.99936,3.99807L 3.99936,3.99807C 2.89436,3.99807 2.00936,4.89406 2.00936,5.99807L 1.99936,17.9981C 1.99936,19.1021 2.89436,19.9981 3.99936,19.9981L 19.9994,19.9981C 21.1029,19.9981 21.9994,19.1021 21.9994,17.9981L 21.9994,7.99807C 21.9994,6.89406 21.1029,5.99807 19.9994,5.99807L 11.9994,5.99807L 9.99936,3.99807 Z '/>
            </svg>
            {repoOwner}/{repoName}
            <RepoSelectionModal
              {...this.props}
              isOpen={this.state.showRepoModal}
              afterOpen={::this.afterOpenModal}
              onclose={::this.onCloseRepoModal}/>
          </a>
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
          <a className='item user' onClick={evt => {this.setState({showProfileModal: true})}}>
            <img src={avatar} />
            <Modal
              className='profile-modal'
              style={ModalCustomStyle}
              isOpen={this.state.showProfileModal}
              onAfterOpen={::this.afterOpenModal}
              onRequestClose={evt => {this.setState({showProfileModal: false})}} >
              <header className='header'>
                <a className='close' id='close-modal' onClick={evt => {this.setState({showProfileModal: false})}}>Close</a>
                <h2>User</h2>
              </header>
              <section className='body'>
                <p><button className='button primary' onClick={() => this.logout()}>Logout</button></p>
              </section>
            </Modal>
          </a>
        </nav>
        <a className='item logo'>
          <img src={require('../assets/logo-small.svg')} alt='logo' />
        </a>
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

        <a className='website item' onClick={evt =>
          this.props.toRoute({
            pathname: `/${collectionType || 'pages' }/${branch || 'master' }/${filePath || ''}`,
            query: { viewing: 'site' }}
          )}>
          <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
            <path d='M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z' />
          </svg>
          View site
        </a>
        <a className='item settings' onClick={evt => {this.setState({showSettingModal: true})}}>
          <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
            <path d='M 11.9994,15.498C 10.0664,15.498 8.49939,13.931 8.49939,11.998C 8.49939,10.0651 10.0664,8.49805 11.9994,8.49805C 13.9324,8.49805 15.4994,10.0651 15.4994,11.998C 15.4994,13.931 13.9324,15.498 11.9994,15.498 Z M 19.4284,12.9741C 19.4704,12.6531 19.4984,12.329 19.4984,11.998C 19.4984,11.6671 19.4704,11.343 19.4284,11.022L 21.5414,9.36804C 21.7294,9.21606 21.7844,8.94604 21.6594,8.73004L 19.6594,5.26605C 19.5354,5.05005 19.2734,4.96204 19.0474,5.04907L 16.5584,6.05206C 16.0424,5.65607 15.4774,5.32104 14.8684,5.06903L 14.4934,2.41907C 14.4554,2.18103 14.2484,1.99805 13.9994,1.99805L 9.99939,1.99805C 9.74939,1.99805 9.5434,2.18103 9.5054,2.41907L 9.1304,5.06805C 8.52039,5.32104 7.95538,5.65607 7.43939,6.05206L 4.95139,5.04907C 4.7254,4.96204 4.46338,5.05005 4.33939,5.26605L 2.33939,8.73004C 2.21439,8.94604 2.26938,9.21606 2.4574,9.36804L 4.5694,11.022C 4.5274,11.342 4.49939,11.6671 4.49939,11.998C 4.49939,12.329 4.5274,12.6541 4.5694,12.9741L 2.4574,14.6271C 2.26938,14.78 2.21439,15.05 2.33939,15.2661L 4.33939,18.73C 4.46338,18.946 4.7254,19.0341 4.95139,18.947L 7.4404,17.944C 7.95639,18.34 8.52139,18.675 9.1304,18.9271L 9.5054,21.577C 9.5434,21.8151 9.74939,21.998 9.99939,21.998L 13.9994,21.998C 14.2484,21.998 14.4554,21.8151 14.4934,21.577L 14.8684,18.9271C 15.4764,18.6741 16.0414,18.34 16.5574,17.9431L 19.0474,18.947C 19.2734,19.0341 19.5354,18.946 19.6594,18.73L 21.6594,15.2661C 21.7844,15.05 21.7294,14.78 21.5414,14.6271L 19.4284,12.9741 Z ' />
          </svg>
          Settings
          <SettingModal
            isBranchPrivate={isBranchPrivate}
            branches={branches}
            isOpen={this.state.showSettingModal}
            afterOpen={::this.afterOpenModal}
            onclose={::this.onCloseSettingModal} />
        </a>
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
