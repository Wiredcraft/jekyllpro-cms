import Immutable from 'immutable'

import { CHANGE_LOGIN_STATE } from '../actions/userActions'

const initialState = Immutable.fromJS({
  isLoggedIn: false,
  userName: '',
  avatar: ''
})

export default function user (state = initialState, action) {
  switch (action.type) {
  case CHANGE_LOGIN_STATE:
    const {isLoggedIn, userName, avatar } = action.payload
    state = state.set('isLoggedIn', isLoggedIn)
    state = state.set('userName', userName)
    state = state.set('avatar', avatar)
    return state
  default:
    return state
  }
}
