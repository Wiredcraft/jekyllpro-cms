/* global API_BASE_URL */
import { getRepoMeta, updateRepoFile, deleteRepoFile } from '../helpers/api'
import { fileRemoved, fileAdded, fileReplaced } from './repoActions'

export const CHANGE_EDITOR_STATE = 'CHANGE_EDITOR_STATE'
export const RESET_EDITOR_DATA = 'RESET_EDITOR_DATA'

export function addNewFile(branch, path, content) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_EDITOR_STATE
    })

    return updateRepoFile({ branch, path, content, message: `add ${path}` })
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

export function deleteFile(branch, path) {
  return dispatch => {
    return deleteRepoFile({ branch, path })
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
          payload: { loading: false },
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
        dispatch({
          payload: { loading: false },
          type: CHANGE_EDITOR_STATE
        })
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

export function resetEditorData () {
  return dispatch => {
    dispatch({
      type: RESET_EDITOR_DATA
    })
  }
}

export function changeEditorMode (mode) {
  return dispatch => {
    dispatch({
      payload: { mode },
      type: CHANGE_EDITOR_STATE
    })
  }
}


export function selectCollectionFile(item) {
  return dispatch => {
    dispatch({
      payload: {selectedCollectionFile: item},
      type: CHANGE_EDITOR_STATE
    })
  }
}

