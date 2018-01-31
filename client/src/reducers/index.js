import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import app from './app'
import editor from './editor'
import repo from './repo'
import user from './user'

const appReducer = combineReducers({
  app,
  editor,
  repo,
  user,
  routing: routerReducer
})

export default function rootReducer (state, action) {
  if (action.type === 'APP_RESET') {
    state = undefined
  }
  return appReducer(state, action)
}
