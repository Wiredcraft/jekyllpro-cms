import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import appReducer from '../reducers'

const rootReducer = (state, action) => {
  if (action.type === 'APP_RESET') {
    state = undefined
  }
  return appReducer(state, action)
}

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware))

export default store
