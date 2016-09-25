/* global API_BASE_URL */
import request from 'superagent'
import { fileRemoved, fileAdded, fileReplaced } from './repoActions'

export const CHANGE_EDITOR_STATE = 'CHANGE_EDITOR_STATE'
export const NEW_EMPTY_FILE = 'NEW_EMPTY_FILE'
export const DELETE_EXISTING_FILE = 'DELETE_EXISTING_FILE'
export const CLEAN_EDITOR = 'CLEAN_EDITOR'

export function fetchFileContent(branch, path, routingUrl) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_EDITOR_STATE
    })

    return new Promise((resolve, reject) => {
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
            reject(err)
          } else {
            dispatch({
              payload: { content: res.body, targetFile: path, loading: false },
              type: CHANGE_EDITOR_STATE
            })
            resolve()
          }
        })      
    })
  }
}

export function updateFile(branch, path, content) {
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
              payload: { content: content, targetFile: path, loading: false },
              type: CHANGE_EDITOR_STATE
            })
            return resolve()
          }
        })
    })
  }
}

export function replaceFile(branch, oldPath, newPath, content) {
  return (dispatch) => {
    let apiUrl = `${API_BASE_URL}/api/repository`

    dispatch({
      payload: { loading: true },
      type: CHANGE_EDITOR_STATE
    })
    let addFileRequest = new Promise((resolve, reject) => {
      request
        .post(`${API_BASE_URL}/api/repository`)
        .send({ branch, path: newPath, content, message: `update ${newPath}` })
        .withCredentials()
        .end((err, res) => {
          if (err) {
            console.error(err)
            dispatch({
              payload: { loading: false },
              type: CHANGE_EDITOR_STATE
            })
            return reject(err)
          }
          let newFilename = res.body.content.name

          return resolve(Promise.all([
              dispatch({
                payload: { content: content, targetFile: newPath, loading: false },
                type: CHANGE_EDITOR_STATE
              }),
              dispatch(fileReplaced(newFilename, oldPath, newPath))
            ]))
        })
    })

    return addFileRequest.then( res => {
      return new Promise((resolve, reject) => {
        request
          .del(apiUrl)
          .send({ branch: branch, path: oldPath })
          .withCredentials()
          .end((err, res) => {
            if (err) {
              console.error(err)
              return reject(err)
            }
            return resolve()
          })        
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

export function addNewFile(branch, path, content) {
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
                  payload: { content: content, targetFile: path, loading: false },
                  type: CHANGE_EDITOR_STATE
                }),
                dispatch(fileAdded(newFilename, path))
              ]))
          }
        })
      
    })
  }
}

export function deleteFile(branch, path) {
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
                dispatch(fileRemoved(path)),
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
