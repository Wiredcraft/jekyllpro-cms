/* global API_BASE_URL */
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { confirmUserIsLogged } from '../actions/userActions'
import Header from './Header'
import Menu from './Menu'
import Editor from './Editor'
import Navigation from './Navigation'
import Media from './Media'
import 'styles/_supplement.scss'
import 'styles/styles.css'

const addEditButtonsSrc = (branch, url) => `(function() {
  console.log("call from injected js")
})()`
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
    const { isLoggedIn, repoLoading, collectionType } = this.props

    return isLoggedIn ? (
      <div id='app' className={repoLoading? 'spinning' : ''}>
        <Header params={this.props.params} />
        { this.props.location.query.viewing !== 'site' ? [
          <Menu key='menu' params={this.props.params} />,
          collectionType !== 'media' && <Navigation key='nav' params={this.props.params} /> ,
          collectionType !== 'media' && <Editor key='editor' params={this.props.params} /> ,
          collectionType === 'media' && <Media key='media' />] :
          <iframe onLoad={() => {
            window.frames[0].window.eval(addEditButtonsSrc(this.props.params.branch, 'http://app.jekyllpro.com/'))
          }}
          style={{width: "100%", minHeight: "2000px", paddingTop: "39px"}}
          src={`http://${this.props.params.branch}.beta-starbucks-com-cn.wiredcraft.jekyllpro.com`} />
        }

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
    repoLoading: state.repo.get('loading'),
    collectionType: state.repo.get('collectionType'),
    isLoggedIn: state.user.get('isLoggedIn')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ confirmUserIsLogged }, dispatch)
}
