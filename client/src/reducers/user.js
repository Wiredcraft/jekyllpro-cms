import Immutable from 'immutable'

import { CHANGE_LOGIN_STATE, USER_LOG_OUT } from '../actions/userActions'

const initialState = Immutable.fromJS({
  loaded: false,
  isLoggedIn: false,
  userName: '',
  avatar: '',
  userUrl: ''
})

export default function user (state = initialState, action) {
  switch (action.type) {
    case USER_LOG_OUT:
      return initialState
    case CHANGE_LOGIN_STATE:
      const { loaded, isLoggedIn, userName, avatar, userUrl } = action.payload
      state = state.set('loaded', loaded)
      state = state.set('isLoggedIn', isLoggedIn)
      state = state.set('userName', userName)
      state = state.set('avatar', avatar)
      state = state.set('userUrl', userUrl)
      return state
    default:
      return state
  }
}
