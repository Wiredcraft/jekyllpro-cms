/* global API_BASE_URL */
import request from 'superagent'


export const CHANGE_REPO_STATE = 'CHANGE_LOGIN_STATE'

export function fetchRepoRootInfo() {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/repository`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          // TODO parse repo info here, we need
        }
      })
  }
}

export function getAllBranch() {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/repository/branch`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          dispatch({
            payload: { branches: res.body },
            type: CHANGE_REPO_STATE
          })
        }
      })
  }
}
