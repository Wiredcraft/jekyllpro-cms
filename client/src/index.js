import 'core-js/fn/object/assign'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import App from './components/Main'
import Navigation from './components/Navigation'
import Editor from './components/Editor'
import TransitionView from './components/TransitionView'
import NotFound from './components/NotFound'
import SelectRepo from './components/SelectRepo'
import store from './stores'

// __DEV__ is global variable defined in webpack,
const history = syncHistoryWithStore(browserHistory, store)

// Render the main component into   the dom
ReactDOM.render((
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={App} >
        <Route path='/:repoOwner/:repoName/' components={{navigation: Navigation, editor: Editor}} />
        <Route path='/:repoOwner/:repoName/link/(:branch)/*' components={{transitionView: TransitionView}} />
        <Route path='/:repoOwner/:repoName/(:collectionType)/(:branch)/*' components={{navigation: Navigation, editor: Editor}} />        
        <Route path='/select' components={{selectRepo: SelectRepo}} />
        <Route path='/*' components={{notFound: NotFound}} />
      </Route>
    </Router>
  </Provider>
), document.getElementById('js-app'))
