/* global API_BASE_URL */
import React from 'react'
import { connect } from 'react-redux'

@connect(mapStateToProps)
export default class Login extends React.Component {
  constructor(props) {
    super(props)
  }

  login() {
    const {location: { query }} = this.props
    const url = `${API_BASE_URL}/api/auth/github?redirect_to=${query.redirect_to}`
    window.location = url
  }

  render() {
    const { isLoggedIn, userLoaded } = this.props

    return userLoaded && isLoggedIn
    ? (<div className='box login'>
        logged in
        </div>)
    : (
        <div className={userLoaded ? 'box login' : 'loading box login'}>
          <section className='card'>
            <img src={require('../assets/logo.svg')} className='logo' alt='Jekyll+' />
            <button className='button primary' onClick={() => this.login()}>Login with GitHub</button>
          </section>
          <small>Built by <a href='http://wiredcraft.com' target='_blank'>Wiredcraft</a>
            | <a href='http://github.com/Wiredcraft/jekyllplus/wiki' target='_blank'>Documentation</a>
            | <a href='http://github.com/Wiredcraft/jekyllplus' target='_blank'>Code</a></small>
        </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    userLoaded: state.user.get('loaded'),
    isLoggedIn: state.user.get('isLoggedIn')
  }
}
