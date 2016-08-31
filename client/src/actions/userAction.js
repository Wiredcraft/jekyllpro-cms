/* global API_BASE_URL */
import request from 'superagent'
import qsParser from 'query-string'
import cookieManager from 'js-cookie'


export const CHANGE_LOGIN_STATE = 'CHANGE_LOGIN_STATE'

export function confirmUserIsLogin() {
  let xToken = undefined

  const qs = qsParser.parse(location.search)
  if(qs.code) {
    xToken = qs.code
    cookieManager.set('authToc', xToken)
  } else {
    const authToc = cookieManager.get('authToc')
    if(authToc) xToken = authToc
  }

  if(!xToken) return

  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/me`)
      .set('X-TOKEN', xToken)
      .end((err, res) => {
        if (err) {
          console.log(err)
        } else {
          dispatch({ type: CHANGE_LOGIN_STATE, payload: { isLogin: true } })
        }
      })
  }
}
