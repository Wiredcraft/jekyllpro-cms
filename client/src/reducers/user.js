import Immutable from 'immutable'

import { CHANGE_LOGIN_STATE } from '../actions/userAction'

const initialState = Immutable.fromJS({
  isLoggedIn: false,
  userName: ''
})

export default function user (state = initialState, action) {
  switch (action.type) {
  case CHANGE_LOGIN_STATE:
    state = state.set('isLoggedIn', action.payload.isLoggedIn)
    return state
  default:
    return state
  }
}
