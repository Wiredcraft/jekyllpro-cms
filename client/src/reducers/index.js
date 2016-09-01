import { combineReducers } from 'redux'

import user from './user'
import repo from './repo'
import app from './app'


export default combineReducers({
  app,
  repo,
  user
})
