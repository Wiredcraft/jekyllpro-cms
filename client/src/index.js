import 'core-js/fn/object/assign'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'

import App from './components/Main'
import store from './stores'

// Render the main component into   the dom
ReactDOM.render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}/>
      <Route path='/(:collectionType)/(:branch)/*' component={App}/>
    </Router>
  </Provider>
), document.getElementById('js-app'))
