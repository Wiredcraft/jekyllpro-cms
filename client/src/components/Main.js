/* global API_BASE_URL */
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { NotificationContainer } from 'react-notifications'

import { confirmUserIsLogged } from '../actions/userActions'
import { toRoute } from '../actions/routeActions'
import Header from './Header'
import Cookie from 'js-cookie'

import 'react-notifications/lib/notifications.css'
import 'styles/_sass/main.scss'
import 'styles/_supplement.scss'
import 'react-select/dist/react-select.css'

@connect(mapStateToProps, mapDispatchToProps)
export default class AppComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = { loadingUserInfo: true, hasSavedRepo: true }
  }

  componentWillMount() {
    const { confirmUserIsLogged, toRoute } = this.props
    confirmUserIsLogged().then(() => {
      if (!Cookie.get('repoOwner') || !Cookie.get('repoName')) {
        this.setState({
          loadingUserInfo: false,
          hasSavedRepo: false
        })
        return toRoute('/select')
      }
      return this.setState({ loadingUserInfo: false, hasSavedRepo: true })
    })
    .catch(() => {
      this.setState({ loadingUserInfo: false })
    })
  }

  componentWillUpdate(nextProps, nextState) {
    const { hasSavedRepo } = this.state
    if ((nextProps.location.pathname === '/select')
      && (nextProps.location.query.reset === '1')
      && hasSavedRepo) {
      this.setState({ hasSavedRepo: false })
    } else if (Cookie.get('repoOwner') && Cookie.get('repoName') && !hasSavedRepo) {
      this.setState({ hasSavedRepo: true })
    }
  }

  login() {
    const url = `${API_BASE_URL}/api/auth/github`
    window.location = url
  }

  render() {
    const { isLoggedIn, repoLoading } = this.props
    const { loadingUserInfo, hasSavedRepo } = this.state

    return isLoggedIn
      ? hasSavedRepo ? (
        <div id='app' className={repoLoading? 'loading' : ''}>
          <Header params={this.props.params} location={this.props.location} />
          {
            this.props.children
          }
          <NotificationContainer />
        </div>
      ) : (
        <div id='landing'>
          {this.props.children}
        </div>
      )
    : (
      <div id='landing' className={loadingUserInfo ? 'coating' : ''}>
        <div className='box login'>
          <section className='card'>
            <img src={require('../assets/logo.svg')} className='logo' alt='Jekyll+' />
            <button className='button primary' onClick={() => this.login()}>Login with GitHub</button>
          </section>
          <small>Built by <a href='http://wiredcraft.com' target='_blank'>Wiredcraft</a>
            | <a href='http://github.com/Wiredcraft/jekyllplus/wiki' target='_blank'>Documentation</a>
            | <a href='http://github.com/Wiredcraft/jekyllplus' target='_blank'>Code</a></small>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    repoLoading: state.repo.get('loading'),
    currentBranch: state.repo.get('currentBranch'),
    isLoggedIn: state.user.get('isLoggedIn')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ confirmUserIsLogged, toRoute }, dispatch)
}
