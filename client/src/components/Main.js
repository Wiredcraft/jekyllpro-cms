/* global API_BASE_URL */
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { confirmUserIsLogged } from '../actions/userActions'
import Menu from './Menu'
import Editor from './Editor'
import Navigation from './Navigation'
// import 'normalize.css/normalize.css'
import 'styles/app.scss'


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
      <button onClick={() => this.login()}>Login</button>
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
