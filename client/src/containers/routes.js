import React from 'react'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import App from 'components/Main'
import Login from 'components/Login'
import ContentListing from 'components/ContentListing'
import Editor from 'components/Editor'
import TransitionView from 'components/TransitionView'
import NotFound from 'components/NotFound'
import SelectRepo from 'components/SelectRepo'

export default function createRouter (store) {
  const history = syncHistoryWithStore(browserHistory, store)

  return (
    <Router history={history}>
      <Route path='/app' component={App}>
        <Route path='login' component={Login} />
        <Route path=':repoOwner/:repoName(/)' component={ContentListing} />
        <Route
          path=':repoOwner/:repoName/link/(:branch)/*'
          component={TransitionView}
        />
        <Route
          path=':repoOwner/:repoName/(:collectionType)/(:branch)/*'
          component={Editor}
        />
        <Route path='select' component={SelectRepo} />
        <Route path='*' component={NotFound} />
      </Route>
    </Router>
  )
}
