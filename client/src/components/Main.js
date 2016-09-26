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
const addEditButtonsSrc = `(function() {
  function changeOpacity (element, child, opacity) {
    child.style.opacity = opacity;
  }

  function addEditableElements(elements) {
    elements.forEach(function(element) {


      var editableElement = document.createElement('a');
      editableElement.style.opacity = 0;
      editableElement.style.position = 'absolute';
      editableElement.style.zIndex = 999;
      editableElement.style.background = '#0A93FF';
      editableElement.style.color =  '#FFF';
      editableElement.style.fontSize = '12px';
      editableElement.style.fontWeight = 'normal';
      editableElement.style.padding = '1px 10px';

      editableElement.addEventListener('mouseenter', function () {
        editableElement.style.opacity = 1;
      })
      editableElement.addEventListener('mouseleave', function () {
        editableElement.style.opacity = 0;
      })
      element.addEventListener('mouseenter', function() {
        changeOpacity(element, editableElement, 1)
        element.style.outline = '2px solid #0A93FF';
        editableElement.style.left = element.offsetLeft + 'px';
        editableElement.style.top = element.offsetTop + 'px';
      });
      element.addEventListener('mouseleave', function() {
        changeOpacity(element, editableElement, 0)
        element.style.outline = '';
      });

      editableElement.setAttribute('href', element.getAttribute('data-source'));
      editableElement.innerHTML = 'Edit';
      window.document.body.appendChild(editableElement);
      console.log('link added')
    })
    console.log("injected edit links")
  }

  addEditableElements(document.querySelectorAll('[data-source]'))
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
          <iframe onLoad={() => window.frames[0].window.eval(addEditButtonsSrc)}
          style={{width: "100%", minHeight: "2000px", paddingTop: "39px"}} src={`http://${this.props.params.branch}.beta-starbucks-com-cn.wiredcraft.jekyllpro.com`} />
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
