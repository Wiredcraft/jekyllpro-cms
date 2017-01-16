/* global API_BASE_URL */
import { getRepoDetails, getRepoMeta, getRepoBranchList, getRepoIndex, getRepoBranchDetails,
  getRepoTree, listRepoHooks, registerRepoHook } from '../helpers/api'
import { resetEditorData } from './editorActions'

export const CHANGE_REPO_STATE = 'CHANGE_REPO_STATE'
export const RESET_REPO_DATA = 'RESET_REPO_DATA'
export const CHECKOUT_BRANCH = 'CHECKOUT_BRANCH'
export const FILE_REMOVED = 'FILE_REMOVED'
export const FILE_ADDED = 'FILE_ADDED'
export const FILE_REPLACED = 'FILE_REPLACED'
export const COLLECTION_FILE_REMOVED = 'COLLECTION_FILE_REMOVED'
export const COLLECTION_FILE_ADDED = 'COLLECTION_FILE_ADDED'
export const COLLECTION_FILE_UPDATED = 'COLLECTION_FILE_UPDATED'

/*
* Repository
*/
export function fetchRepoInfo() {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })
    return getRepoDetails()
      .then(data => {        
        dispatch({
          payload: {
            loading: false,
            currentBranch: data.default_branch,
            repoDetails: {
              isPrivate: data.private,
              updatedAt: data.pushed_at,
              url: data.html_url,
              ownerAvatar: data.owner.avatar_url
            },
          },
          type: CHANGE_REPO_STATE
        })
      })
      .catch(err => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_REPO_STATE
        })
        // make sure the caller can catch to do more error handler
        return Promise.reject(err)
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
    if (!opts || !opts.refresh) {
      dispatch({
        payload: { loading: true },
        type: CHANGE_REPO_STATE
      })
    }
    return getRepoIndex(opts || {})
      .then(data => {        
        dispatch({
          payload: {
            collections: data.collections,
            schemas: data.schemas,
            config: data.config,
            indexUpdatedAt: data.updated,
            loading: false
          },
          type: CHANGE_REPO_STATE
        })

        return data
      })
      .catch(err => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_REPO_STATE
        }) 
        // make sure the caller can catch to do more error handler
        return Promise.reject(err)       
      })
  }
}

export function fetchRepoTree(branch) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })
    return getRepoTree(branch)
      .then(data => {        
        dispatch({
          payload: { treeMeta: data.tree, loading: false },
          type: CHANGE_REPO_STATE
        })
        return data
      })
      .catch(err => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_REPO_STATE
        })        
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

export function getCurrentBranchUpdateTime(branch) {
  return dispatch => {
    return getRepoBranchDetails(branch)
      .then(data => {
        dispatch({
          payload: { currentBranchUpdatedAt: data.commit.commit.author.date },
          type: CHANGE_REPO_STATE
        })
      })
  }
}

export function checkoutBranch(branch) {
  return dispatch => {
    return Promise.all([
      dispatch({
        payload: {
          currentBranch: branch
         },
        type: CHECKOUT_BRANCH
      }),
      // dispatch(fetchRepoIndex({ branch })),
      dispatch(resetEditorData())
    ])
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

export function resetUpdateSignal() {
  return dispatch => {
    dispatch({
      payload: { repoUpdateSignal: false },
      type: CHANGE_REPO_STATE
    })
  }
}
