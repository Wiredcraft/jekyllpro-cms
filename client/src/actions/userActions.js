/* global API_BASE_URL */
import { getUser, logoutUser } from '../helpers/api'

export const CHANGE_LOGIN_STATE = 'CHANGE_LOGIN_STATE'

export function confirmUserIsLogged() {
  return dispatch => {
    return getUser()
      .then(data => {
        dispatch({
          type: CHANGE_LOGIN_STATE,
          payload: { isLoggedIn: true, userName: data.login, avatar: data.avatar_url, userUrl: data.html_url }
        })
      })
  }
}

export function logout() {
  return dispatch => {
    return logoutUser()
      .then(() => {
        dispatch({
          type: 'APP_RESET'
        })       
      })
  }
}

