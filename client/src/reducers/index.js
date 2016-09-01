import { combineReducers } from 'redux'

import app from './app'
import editor from './editor'
import repo from './repo'
import user from './user'


export default combineReducers({
  app,
  editor,
  repo,
  user
})