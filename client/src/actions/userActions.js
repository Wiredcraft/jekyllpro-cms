/* global API_BASE_URL */
import { getUser, logoutUser } from '../helpers/api'

import { fetchRepoInfo, fetchBranchSchema } from './repoActions'

export const CHANGE_LOGIN_STATE = 'CHANGE_LOGIN_STATE'

export function confirmUserIsLogged() {
  return dispatch => {
    return getUser()
      .then(data => {
        dispatch({
          type: CHANGE_LOGIN_STATE,
          payload: { isLoggedIn: true, userName: data.login, avatar: data.avatar_url }
        })
        dispatch(fetchRepoInfo())
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

