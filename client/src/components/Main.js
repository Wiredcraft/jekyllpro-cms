/* global API_BASE_URL */
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { confirmUserIsLogged } from '../actions/userActions'
import Menu from './Menu'
import Editor from './Editor'
import Navigation from './Navigation'
import 'styles/app.scss'
import 'styles/_supplement.scss'


@connect(mapStateToProps, mapDispatchToProps)
export default class AppComponent extends React.Component {
  componentDidMount() {
    const { confirmUserIsLogged } = this.props
    confirmUserIsLogged()
  }

  login() {
    const url = `${API_BASE_URL}/api/auth/github`
    window.location = url
  }

  render() {
    const { isLoggedIn } = this.props

    return isLoggedIn ? (
      <div id='app'>
        <Menu />
        <Navigation />
        <Editor />
      </div>
    ) : (
      <div id='landing' style={{'display': 'block'}}>
        <div className='card'>
          <button className='button primary' onClick={() => this.login()}>Login with GitHub</button>
          <small>No account yet? <a>Sign up for free</a>.</small>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    isLoggedIn: state.user.get('isLoggedIn')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ confirmUserIsLogged }, dispatch)
}
