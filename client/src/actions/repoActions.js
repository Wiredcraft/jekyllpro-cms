/* global API_BASE_URL */
import { getRepoDetails, getRepoMeta, getRepoBranchList, getRepoIndex, getRepoTree,
  listRepoHooks, registerRepoHook } from '../helpers/api'
import { cleanEditor } from './editorActions'

export const CHANGE_REPO_STATE = 'CHANGE_REPO_STATE'
export const RESET_REPO_DATA = 'RESET_REPO_DATA'
export const FILE_REMOVED = 'FILE_REMOVED'
export const FILE_ADDED = 'FILE_ADDED'
export const FILE_REPLACED = 'FILE_REPLACED'
export const COLLECTION_FILE_REMOVED = 'COLLECTION_FILE_REMOVED'
export const COLLECTION_FILE_ADDED = 'FILE_ADDED'
export const COLLECTION_FILE_UPDATED = 'COLLECTION_FILE_UPDATED'

/*
* Repository
*/
export function fetchRepoInfo() {
  return dispatch => {
    return getRepoDetails()
      .then(data => {        
        dispatch({
          payload: {currentBranch: data.default_branch, repoName: data.full_name},
          type: CHANGE_REPO_STATE
        })
      })
  }
}


export function resetRepoData () {
  return dispatch => {
    dispatch({
      type: RESET_REPO_DATA
    })
  }
}

export function fetchRepoIndex(opts) {
  return dispatch => {
    return getRepoIndex(opts || {})
      .then(data => {        
        dispatch({
          payload: {collections: data.collections, schemas: data.schemas},
          type: CHANGE_REPO_STATE
        })
        return data
      })
  }
}

export function fetchRepoTree(branch) {
  return dispatch => {
    return getRepoTree(branch)
      .then(data => {        
        dispatch({
          payload: {treeMeta: data.tree},
          type: CHANGE_REPO_STATE
        })
        return data
      })
  }
}

export function listHooks () {
  return dispatch => {
    return listRepoHooks()
      .then(data => {
        let hasIndexHook = data.some((hook) => {
          return hook.config.url === `${API_BASE_URL}/api/webhook`
        })
        dispatch({
          payload: { hasIndexHook },
          type: CHANGE_REPO_STATE
        })  
      })
      .catch(err => {
        console.log(err)      
      })
  }
}

/*
* branch
*/

export function getAllBranch() {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })

    return getRepoBranchList()
      .then(data => {
        dispatch({
          payload: { branches: data, loading: false },
          type: CHANGE_REPO_STATE
        })
      })
      .catch(() => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_REPO_STATE
        })        
      })
  }
}

export function checkoutBranch(branch) {
  return dispatch => {
    Promise.all([
      dispatch({
        payload: { currentBranch: branch },
        type: CHANGE_REPO_STATE
      }),
      dispatch(cleanEditor())
    ])
  }
}

export function isBranchPrivate(branch) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })

    return getRepoMeta({ branch, path: 'PROTECTED', raw: true })
      .then(data => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_REPO_STATE
        })
        return {isPrivate: true}
      })
      .catch(err => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_REPO_STATE
        })
        return {isPrivate: false}
      })
  }
}

/*
* files/collection files data operation in local app state
*/

export function fileAdded(path) {
  return dispatch => {
    dispatch({
      payload: {path},
      type: FILE_ADDED
    })
  }
}

export function fileRemoved(path) {
  return dispatch => {
    dispatch({
      payload: { path },
      type: FILE_REMOVED
    })
  }
}

export function fileReplaced(oldPath, newPath) {
  return dispatch => {
    dispatch({
      payload: { oldPath, newPath },
      type: FILE_REPLACED
    })
  }
}

export function collectionFileAdded(newFileData) {
  return dispatch => {
    dispatch({
      payload: { newFileData },
      type: COLLECTION_FILE_ADDED
    })
  }
}
export function collectionFileRemoved(path) {
  return dispatch => {
    dispatch({
      payload: { path },
      type: COLLECTION_FILE_REMOVED
    })
  }
}

export function collectionFileUpdated(oldPath, newFileData) {
  return dispatch => {
    dispatch({
      payload: { oldPath, newFileData },
      type: COLLECTION_FILE_UPDATED
    })
  }
}
