/* global API_BASE_URL */
import { getRepoMeta, updateRepoFile, deleteRepoFile } from '../helpers/api'
import { fileRemoved, fileAdded, fileReplaced } from './repoActions'

export const CHANGE_EDITOR_STATE = 'CHANGE_EDITOR_STATE'
export const NEW_EMPTY_FILE = 'NEW_EMPTY_FILE'
export const DELETE_EXISTING_FILE = 'DELETE_EXISTING_FILE'
export const CLEAN_EDITOR = 'CLEAN_EDITOR'
export const RESET_EDITOR_DATA = 'RESET_EDITOR_DATA'

export function fetchFileContent(branch, path) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_EDITOR_STATE
    })

    return getRepoMeta({ branch, path, raw: true})
      .then(data => {
        dispatch({
          payload: { content: data, targetFile: path, loading: false },
          type: CHANGE_EDITOR_STATE
        })
      })
      .catch(err => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_EDITOR_STATE
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

    return updateRepoFile({ branch, path, content })
      .then(data => {
        dispatch({
          payload: { content: content, targetFile: path, loading: false },
          type: CHANGE_EDITOR_STATE
        })
      })
      .catch(err => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_EDITOR_STATE
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
    let addFileRequest = updateRepoFile({ branch, path: newPath, content })
      .then(data => {
        let newFilename = data.content.name

        return Promise.all([
            dispatch({
              payload: { content: content, targetFile: newPath, loading: false },
              type: CHANGE_EDITOR_STATE
            }),
            dispatch(fileReplaced(newFilename, oldPath, newPath))
          ])
      })
      .catch(err => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_EDITOR_STATE
        })
      })

    return addFileRequest.then( res => {
      return deleteRepoFile({ branch: branch, path: oldPath })
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

    return updateRepoFile({ branch, path, content, message: `add ${path}` })
      .then(data => {
        let newFilename = data.content.name
        return Promise.all([
            dispatch({
              payload: { content: content, targetFile: path, loading: false },
              type: CHANGE_EDITOR_STATE
            }),
            dispatch(fileAdded(newFilename, path))
          ])
      })
      .catch(err => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_EDITOR_STATE
        })
      })
  }
}

export function deleteFile(branch, path) {
  return dispatch => {
    return deleteRepoFile({ branch, path })
      .then(data => {
        return Promise.all([
            dispatch(fileRemoved(path)),
            dispatch({type: DELETE_EXISTING_FILE})
          ])
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

export function resetEditorData () {
  return dispatch => {
    dispatch({
      type: RESET_EDITOR_DATA
    })
  }
}
