/* global API_BASE_URL */
import request from 'superagent'

import { parseFilesMeta } from '../helpers/repo'


export const CHANGE_REPO_STATE = 'CHANGE_REPO_STATE'

export function fetchRepoRootInfo() {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/repository`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
        }
      })
  }
}

export function fetchFilesMeta() {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/repository?path=_posts`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          const filesMeta = parseFilesMeta(res.body)
          dispatch({
            payload: { filesMeta },
            type: CHANGE_REPO_STATE
          })
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