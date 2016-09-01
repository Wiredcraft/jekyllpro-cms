/* global API_BASE_URL */
import request from 'superagent'

import { fetchFilesMeta } from './repoActions'


export const CHANGE_LOGIN_STATE = 'CHANGE_LOGIN_STATE'

export function confirmUserIsLogged() {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/me`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          Promise.all([
            dispatch(fetchFilesMeta()),
            dispatch({
              type: CHANGE_LOGIN_STATE,
              payload: { isLoggedIn: true }
            })
          ])
        }
      }
    )
  }
}
