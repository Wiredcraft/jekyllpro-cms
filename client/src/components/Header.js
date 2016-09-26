import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import { getAllBranch, checkoutBranch, fetchFilesMeta,
  fetchPageFilesMeta, isBranchPrivate, openSiteInIframe } from '../actions/repoActions'
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
  constructor() {
    super()
    this.state = {
      showProfileModal: false,
      showRepoModal: false,
      showSettingModal: false
    }
  }

  componentWillMount() {
    this.props.getAllBranch()
  }

  handleBranchChange(evt) {
    const newBranch = evt.target.value
    const {checkoutBranch, toRoute} = this.props
    const { collectionType, branch, splat: filePath} = this.props.params
    checkoutBranch(newBranch)
    toRoute(`/${collectionType}/${newBranch}/${filePath || ''}`)
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

  render () {
    const { branches, currentBranch, avatar, userName, repoName, isBranchPrivate,
    params: { collectionType, branch, splat: filePath} } = this.props

    return (
      <header id='header'>
        <a onClick={evt => {this.setState({showProfileModal: true})}} className='profile'>
          <img src={avatar} />
          {userName}
        </a>
        <Modal
          className='profile-modal'
          style={ModalCustomStyle}
          isOpen={this.state.showProfileModal}
          onAfterOpen={::this.afterOpenModal}
          onRequestClose={evt => {this.setState({showProfileModal: false})}} >
          <header className='header'>
            <a className='close' id='close-modal' onClick={evt => {this.setState({showProfileModal: false})}}>Close</a>
            <h2>This is a modal</h2>
          </header>
          <section className='body'>
            <p><button className='button primary' onClick={() => this.logout()}>Logout</button></p>
          </section>
        </Modal>
        <a className='logo'><img src={require('file?name=/assets/logo-small.svg!../assets/logo-small.svg')} /></a>
        <a className='repo' onClick={evt => {this.setState({showRepoModal: true})}}>
          <RepoIcon />
          {repoName}
          <span>Repo</span>
        </a>
        <RepoSelectionModal
          isOpen={this.state.showRepoModal}
          afterOpen={::this.afterOpenModal}
          onclose={::this.onCloseRepoModal}/>
        <div className='branch'>
          <BranchIcon />
          { branches && (<div className="select">
              <select value={currentBranch} onChange={::this.handleBranchChange}>
                {branches && branches.map((b) => {
                  return (
                    <option key={b.name}>{ b.name }</option>
                  )
                })}
              </select>
            </div>)
          }
          <span>Branch</span>
        </div>
        <a className="settings" onClick={evt => {this.setState({showSettingModal: true})}}>
          <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
            <path strokeWidth="0.2" strokeLinejoin="round" d="M 11.9994,15.498C 10.0664,15.498 8.49939,13.931 8.49939,11.998C 8.49939,10.0651 10.0664,8.49805 11.9994,8.49805C 13.9324,8.49805 15.4994,10.0651 15.4994,11.998C 15.4994,13.931 13.9324,15.498 11.9994,15.498 Z M 19.4284,12.9741C 19.4704,12.6531 19.4984,12.329 19.4984,11.998C 19.4984,11.6671 19.4704,11.343 19.4284,11.022L 21.5414,9.36804C 21.7294,9.21606 21.7844,8.94604 21.6594,8.73004L 19.6594,5.26605C 19.5354,5.05005 19.2734,4.96204 19.0474,5.04907L 16.5584,6.05206C 16.0424,5.65607 15.4774,5.32104 14.8684,5.06903L 14.4934,2.41907C 14.4554,2.18103 14.2484,1.99805 13.9994,1.99805L 9.99939,1.99805C 9.74939,1.99805 9.5434,2.18103 9.5054,2.41907L 9.1304,5.06805C 8.52039,5.32104 7.95538,5.65607 7.43939,6.05206L 4.95139,5.04907C 4.7254,4.96204 4.46338,5.05005 4.33939,5.26605L 2.33939,8.73004C 2.21439,8.94604 2.26938,9.21606 2.4574,9.36804L 4.5694,11.022C 4.5274,11.342 4.49939,11.6671 4.49939,11.998C 4.49939,12.329 4.5274,12.6541 4.5694,12.9741L 2.4574,14.6271C 2.26938,14.78 2.21439,15.05 2.33939,15.2661L 4.33939,18.73C 4.46338,18.946 4.7254,19.0341 4.95139,18.947L 7.4404,17.944C 7.95639,18.34 8.52139,18.675 9.1304,18.9271L 9.5054,21.577C 9.5434,21.8151 9.74939,21.998 9.99939,21.998L 13.9994,21.998C 14.2484,21.998 14.4554,21.8151 14.4934,21.577L 14.8684,18.9271C 15.4764,18.6741 16.0414,18.34 16.5574,17.9431L 19.0474,18.947C 19.2734,19.0341 19.5354,18.946 19.6594,18.73L 21.6594,15.2661C 21.7844,15.05 21.7294,14.78 21.5414,14.6271L 19.4284,12.9741 Z "></path>
          </svg>
          Settings
        </a>
        <SettingModal
          isBranchPrivate={isBranchPrivate}
          branches={branches}
          isOpen={this.state.showSettingModal}
          afterOpen={::this.afterOpenModal}
          onclose={::this.onCloseSettingModal} />
        <a className="website"
        onClick={evt =>
          this.props.toRoute({
            pathname: `/${collectionType || 'pages' }/${branch || 'master' }/${filePath || ''}`,
            query: { viewing: 'site' }}
          )}>
          <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0z" fill="none"></path>
            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
          </svg>
          View website
        </a>
      </header>
    )
  }
}

function mapStateToProps(state, { params:
  { collectionType, branch, splat: path } }) {

  return {
    currentBranch: branch || 'master',
    avatar: state.user.get('avatar'),
    userName: state.user.get('userName'),
    branches: state.repo.get('branches'),
    repoName: state.repo.get('repoName')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ getAllBranch, checkoutBranch, logout,
    isBranchPrivate, toRoute }, dispatch)
}
