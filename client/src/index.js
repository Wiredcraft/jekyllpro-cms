import 'core-js/fn/object/assign'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import App from './components/Main'
import store from './stores'

// __DEV__ is global variable defined in webpack,
// if in developement, using hash history
const history = __DEV__ ? syncHistoryWithStore(hashHistory, store) : syncHistoryWithStore(browserHistory, store)

// Render the main component into   the dom
ReactDOM.render((
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={App}/>
      <Route path='/(:collectionType)/(:branch)/*' component={App}/>
    </Router>
  </Provider>
), document.getElementById('js-app'))
