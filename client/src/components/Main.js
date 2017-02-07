/* global API_BASE_URL */
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { NotificationContainer } from 'react-notifications'

import { confirmUserIsLogged } from '../actions/userActions'
import { toRoute } from '../actions/routeActions'
import Header from './Header'
import Cookie from 'js-cookie'
import 'codemirror/lib/codemirror.css'
import 'react-notifications/lib/notifications.css'
import 'styles/_sass/main.scss'
import 'styles/_supplement.scss'
import 'react-select/dist/react-select.css'

@connect(mapStateToProps, mapDispatchToProps)
export default class AppComponent extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    const { confirmUserIsLogged, toRoute } = this.props
    confirmUserIsLogged().then(() => {
      if (!Cookie.get('repoOwner') || !Cookie.get('repoName')) {
        toRoute('/select')
      }
    }).catch(err => {
      toRoute('/login')
    })
  }

  render() {
    const { isLoggedIn, userLoaded, repoLoading, location: { pathname } } = this.props

    return isLoggedIn && (pathname !== '/select')
      ? (<div id='app' className={repoLoading? 'loading' : ''}>
          <Header params={this.props.params} location={this.props.location} />
          {
            this.props.children
          }
          <NotificationContainer />
        </div>)
      : (<div id='landing' className={userLoaded ? '' : 'coating'}>
          {this.props.children}
        </div>)
  }
}

function mapStateToProps(state) {
  return {
    repoLoading: state.repo.get('loading'),
    userLoaded: state.user.get('loaded'),
    isLoggedIn: state.user.get('isLoggedIn')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ confirmUserIsLogged, toRoute }, dispatch)
}
