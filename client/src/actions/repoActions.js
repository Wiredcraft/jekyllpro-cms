/* global API_BASE_URL */
import request from 'superagent'

import { parseFilesMeta } from '../helpers/repo'
import { fetchDefaultSchema, cleanEditor } from './editorActions'

export const CHANGE_REPO_STATE = 'CHANGE_REPO_STATE'
export const FILE_REMOVED = 'FILE_REMOVED'
export const FILE_ADDED = 'FILE_ADDED'

export function fetchRepoInfo() {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/repository/details`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          const default_branch = res.body.default_branch
          dispatch({
            payload: {currentBranch: default_branch},
            type: CHANGE_REPO_STATE
          })
        }
      })
  }
}

export function fetchFilesMeta(branch) {
  let url = branch ? `${API_BASE_URL}/api/repository?ref=${branch}&path=_posts` : `${API_BASE_URL}/api/repository?path=_posts`

  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })

    request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
          dispatch({
            payload: { loading: false },
            type: CHANGE_REPO_STATE
          })
        } else {
          const filesMeta = parseFilesMeta(res.body)
          dispatch({
            payload: { filesMeta, loading: false },
            type: CHANGE_REPO_STATE
          })
        }
      })
  }
}

export function fileRemoved(index) {
  return dispatch => {
    dispatch({
      payload: { fileIndex: index },
      type: FILE_REMOVED
    })
  }
}

export function fileAdded(name, path) {
  return dispatch => {
    dispatch({
      payload: {name, path},
      type: FILE_ADDED
    })
  }  
}

export function getAllBranch() {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })

    request
      .get(`${API_BASE_URL}/api/repository/branch`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
          dispatch({
            payload: { loading: false },
            type: CHANGE_REPO_STATE
          })
        } else {
          dispatch({
            payload: { branches: res.body, loading: false },
            type: CHANGE_REPO_STATE
          })
        }
      })
  }
}

export function checkoutBranch(branch) {
  return dispatch => {
    Promise.all([
      dispatch(fetchDefaultSchema(branch)),
      dispatch(fetchFilesMeta(branch)),
      dispatch({
        payload: { currentBranch: branch },
        type: CHANGE_REPO_STATE
      }),
      dispatch(cleanEditor())
    ])
  }
}
