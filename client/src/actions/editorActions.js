/* global API_BASE_URL */
import request from 'superagent'
import { fileRemoved, fileAdded } from './repoActions'
const defaultSchema = require('../schema/posts.json')

export const CHANGE_EDITOR_STATE = 'CHANGE_EDITOR_STATE'
export const NEW_EMPTY_FILE = 'NEW_EMPTY_FILE'
export const DELETE_EXISTING_FILE = 'DELETE_EXISTING_FILE'

// TODO remove this hard coding, fetch config based on current selected collection
export function fetchDefaultSchema() {
  return dispatch => {
    // using local schema file for now
    return dispatch({
      payload: { schema: defaultSchema },
      type: CHANGE_EDITOR_STATE      
    })

    request
      .get(`${API_BASE_URL}/api/repository?path=_schema/posts.json`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          dispatch({
            payload: { schema: JSON.parse(atob(res.body.content)) },
            type: CHANGE_EDITOR_STATE
          })
        }
      })
  }
}

export function fetchFileContent(path, index) {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/repository?path=${path}&raw=true`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          dispatch({
            payload: { content: res.body, fileIndex: index },
            type: CHANGE_EDITOR_STATE
          })
        }
      })
  }
}

export function updateFile(path, content, index) {
  return dispatch => {
    request
      .post(`${API_BASE_URL}/api/repository`)
      .send({ path, content, message: `update ${path}` })
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          dispatch({
            payload: { content: content, fileIndex: index },
            type: CHANGE_EDITOR_STATE
          })
        }
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

export function addNewFile(path, content, index) {
  
  return dispatch => {
    request
      .post(`${API_BASE_URL}/api/repository`)
      .send({ path, content, message: `update ${path}` })
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          let newFilename = res.body.content.name
          return Promise.all([
            dispatch({
              payload: { content: content, fileIndex: index },
              type: CHANGE_EDITOR_STATE
            }),
            dispatch(fileAdded(newFilename, path))
          ])
        }
      })
  }
}

export function deleteFile(path, index) {
  return dispatch => {
    request
      .del(`${API_BASE_URL}/api/repository`)
      .send({ path })
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          return Promise.all([
            dispatch(fileRemoved(index)),
            dispatch({type: DELETE_EXISTING_FILE})
          ])
        }
      })
  }
}

