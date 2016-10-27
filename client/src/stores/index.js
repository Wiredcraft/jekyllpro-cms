import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import { browserHistory, hashHistory } from 'react-router'
import appReducer from '../reducers'

const rootReducer = (state, action) => {
  if (action.type === 'APP_RESET') {
    state = undefined
  }
  return appReducer(state, action)
}

// __DEV__ is global variable defined in webpack,
// if in developement, using hash history
let history = __DEV__ ? hashHistory : browserHistory
let composeEnhancers = __DEV__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose

const store = createStore(rootReducer, composeEnhancers(
  applyMiddleware(thunkMiddleware, routerMiddleware(history))
))

export default store
