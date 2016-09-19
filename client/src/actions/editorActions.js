/* global API_BASE_URL */
import request from 'superagent'
import { fileRemoved, fileAdded } from './repoActions'

export const CHANGE_EDITOR_STATE = 'CHANGE_EDITOR_STATE'
export const NEW_EMPTY_FILE = 'NEW_EMPTY_FILE'
export const DELETE_EXISTING_FILE = 'DELETE_EXISTING_FILE'
export const CLEAN_EDITOR = 'CLEAN_EDITOR'

export function fetchFileContent(branch, path, index) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_EDITOR_STATE
    })

    request
      .get(`${API_BASE_URL}/api/repository?ref=${branch}&path=${path}&raw=true`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
          dispatch({
            payload: { loading: false },
            type: CHANGE_EDITOR_STATE
          })
        } else {
          dispatch({
            payload: { content: res.body, fileIndex: index, loading: false },
            type: CHANGE_EDITOR_STATE
          })
        }
      })
  }
}

export function updateFile(branch, path, content, index) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_EDITOR_STATE
    })

    return new Promise((resolve, reject) => {
      request
        .post(`${API_BASE_URL}/api/repository`)
        .send({ branch, path, content, message: `update ${path}` })
        .withCredentials()
        .end((err, res) => {
          if (err) {
            console.error(err)
            
            dispatch({
              payload: { loading: false },
              type: CHANGE_EDITOR_STATE
            })
            return reject(err)
          } else {
            dispatch({
              payload: { content: content, fileIndex: index, loading: false },
              type: CHANGE_EDITOR_STATE
            })
            return resolve()
          }
        })
    })
  }
}

export function createEmptyFile() {
  return dispatch => {  
    dispatch({
      type: NEW_EMPTY_FILE
    })
  }
}

export function addNewFile(branch, path, content, index) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_EDITOR_STATE
    })

    return new Promise((resolve, reject) => {
      request
        .post(`${API_BASE_URL}/api/repository`)
        .send({ branch, path, content, message: `update ${path}` })
        .withCredentials()
        .end((err, res) => {
          if (err) {
            console.error(err)
            dispatch({
              payload: { loading: false },
              type: CHANGE_EDITOR_STATE
            })
            return reject(err)
          } else {
            let newFilename = res.body.content.name
            return resolve(Promise.all([
                dispatch({
                  payload: { content: content, fileIndex: index, loading: false },
                  type: CHANGE_EDITOR_STATE
                }),
                dispatch(fileAdded(newFilename, path))
              ]))
          }
        })
      
    })
  }
}

export function deleteFile(branch, path, index) {
  return dispatch => {
    return new Promise((resolve, reject) => {
      request
        .del(`${API_BASE_URL}/api/repository`)
        .send({ branch: branch, path: path })
        .withCredentials()
        .end((err, res) => {
          if (err) {
            console.error(err)
            return reject(err)
          } else {
            return resolve(Promise.all([
                dispatch(fileRemoved(index)),
                dispatch({type: DELETE_EXISTING_FILE})
              ]))
          }
        })      
    })
  }
}

export function cleanEditor() {
  return dispatch => {
    dispatch({
      type: CLEAN_EDITOR
    })
  }
}


