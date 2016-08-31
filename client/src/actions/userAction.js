/* global API_BASE_URL */
import request from 'superagent'


export const CHANGE_LOGIN_STATE = 'CHANGE_LOGIN_STATE'

export function confirmUserIsLogin() {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/me`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.log(err)
        } else {
          dispatch({ type: CHANGE_LOGIN_STATE, payload: { isLogin: true } })
        }
      })
  }
}
