import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import { getAllBranch, checkoutBranch, fetchFilesMeta, fetchPageFilesMeta } from '../actions/repoActions'
import { logout } from '../actions/userActions'

import RepoIcon from './svg/RepoIcon'
import BranchIcon from './svg/BranchIcon'
import Modal from 'react-modal'
import ModalCustomStyle from './Modal'

@connect(mapStateToProps, mapDispatchToProps)
export default class Header extends Component {
  constructor() {
    super()
    this.state = { showProfileModel: false }
  }

  componentWillMount() {
    this.props.getAllBranch()
  }

  handleBranchChange(evt) {
    this.props.checkoutBranch(evt.target.value)
  }

  logout () {
    this.props.logout()
  }

  render () {
    const { branches, currentBranch, avatar, userName, repoName } = this.props

    return (
      <header id='header'>
        <a onClick={evt => {this.setState({showProfileModel: true})}} className='profile'>
          <img src={avatar} />
          {userName}
        </a>
        <Modal
          style={ModalCustomStyle}
          isOpen={this.state.showProfileModel} 
          onRequestClose={evt => {this.setState({showProfileModel: false})}} >
          <header className='header'>
            <a className='close' id='close-modal' onClick={evt => {this.setState({showProfileModel: false})}}>Close</a>
            <h2>This is a modal</h2>
          </header>
          <section className='body'>
            <p><button className='button primary' onClick={() => this.logout()}>Logout</button></p>
          </section>
        </Modal>

        <a className='logo'><img src='assets/logo-small.svg'/></a>

        <a className='repo'>
          <RepoIcon />
          {repoName}
        </a>

        <span className='branch'>
          <BranchIcon />
          { branches && (<span className="select">
              <select value={currentBranch} onChange={::this.handleBranchChange}>
                {branches && branches.map((b) => {
                  return (
                    <option key={b.name}>{ b.name }</option>
                  )
                })}
              </select>
            </span>)
          }
        </span>
      </header>
    )
  }
}

function mapStateToProps(state) {
  return {
    avatar: state.user.get('avatar'),
    userName: state.user.get('userName'),
    branches: state.repo.get('branches'),
    currentBranch: state.repo.get('currentBranch'),
    repoName: state.repo.get('repoName')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ getAllBranch, checkoutBranch, logout}, dispatch)
}
