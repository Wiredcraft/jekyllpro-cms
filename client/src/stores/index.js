import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import { browserHistory } from 'react-router'
import appReducer from '../reducers'

const rootReducer = (state, action) => {
  if (action.type === 'APP_RESET') {
    state = undefined
  }
  return appReducer(state, action)
}

const store = createStore(rootReducer,
  applyMiddleware(thunkMiddleware, routerMiddleware(browserHistory)))

export default store
