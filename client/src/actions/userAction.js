/* global API_BASE_URL */
import request from 'superagent'


export const CHANGE_LOGIN_STATE = 'CHANGE_LOGIN_STATE'

export function confirmUserIsLogin(isLogin) {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/me`)
      .end((err, res) => {
        if (err) {
          console.log(err)
        } else {
          console.log(res);
        }
      })
    return dispatch({ type: CHANGE_LOGIN_STATE, payload: { isLogin } })
  }
}
