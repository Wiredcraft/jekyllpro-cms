/* global API_BASE_URL */
import { getRepoDetails, getRepoMeta, getRepoBranchList, getBranchSchema, getRepoIndex } from '../helpers/api'
import { parseFilesMeta } from '../helpers/repo'
import { fetchDefaultSchema, cleanEditor } from './editorActions'

export const CHANGE_REPO_STATE = 'CHANGE_REPO_STATE'
export const FILE_REMOVED = 'FILE_REMOVED'
export const FILE_ADDED = 'FILE_ADDED'
export const FILE_REPLACED = 'FILE_REPLACED'
export const RESET_REPO_DATA = 'RESET_REPO_DATA'

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

export function fetchFilesMeta(branch, path, collectionType) {
  return dispatch => {
    if (collectionType === 'media') {
      return dispatch({
        payload: { collectionType: 'media' },
        type: CHANGE_REPO_STATE
      })
    }
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })
    dispatch(cleanEditor())

    return getRepoMeta({ branch, path })
      .then(data => {
        const filesMeta = parseFilesMeta(data)

        dispatch({
          payload: { filesMeta, collectionType, loading: false, selectedFolder: path },
          type: CHANGE_REPO_STATE
        })
      })
      .catch(err =>{        
        dispatch({
          payload: { loading: false, filesMeta: [], selectedFolder: path, collectionType },
          type: CHANGE_REPO_STATE
        })
      })
  }
}

export function fetchPageFilesMeta(branch) {
  var pages = []
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })
    dispatch(cleanEditor())

    return getRepoMeta({ branch })
      .then(data => {
        pages = data.filter( item => {
          return (item.type === 'file') && (/\.(html|HTML)$/.test(item.name))
        })
        pages = parseFilesMeta(pages)

        var folderRequests = data.filter( item => {
          return (item.type === 'dir') && (/^[a-zA-Z0-9]/.test(item.name))
          }).map( dir => {
            return getRepoMeta({ branch, path: `${dir.path}` })
              .then(subData => {
                var dirData = subData.filter( item => {
                  return (item.type === 'file') && (/\.(html|HTML)$/.test(item.name))
                })
                if (dirData.length === 0) {
                  return {name: dir.name}
                }
                dirData = parseFilesMeta(dirData)
                return {name: dir.name, children: dirData}
              })
              .catch(err => {
                return {name: dir.name}
              })
          })
        return Promise.all(folderRequests)
          .then( resultArray => {
            resultArray = resultArray.filter( item => {
              return !!item.children
            })
            pages = pages.concat(resultArray)
            console.log(pages)
            dispatch({
              payload: { filesMeta: pages, loading: false, selectedFolder: 'pages' },
              type: CHANGE_REPO_STATE
            })
          })
      })
      .catch(err => {
        return dispatch({
          payload: { loading: false, filesMeta: [], selectedFolder: 'pages' },
          type: CHANGE_REPO_STATE
        })
      })
  }
}

const makeNestedRequest = (branch, path, name) => {
  return getRepoMeta({ branch, path })
    .then(list => {
      return list.map((item) => {
        if (item.type === 'file') {
          return Promise.resolve({ name: item.name, path: item.path, url: item.url })
        }
        if (item.type === 'dir') {
          var dirRequest = getRepoMeta({ branch, path: item.path })
            .then(resultArray => {
              return Promise.resolve({name: item.name, children: resultArray })
            })
          return dirRequest
        }
      })
    })
    .catch( err => {
      console.log(err)
      return Promise.resolve([{name: name}])
    })
}

export function fetchNestedFilesMeta(branch, path, collectionType) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })
    dispatch(cleanEditor())

    return makeNestedRequest(branch, path, path)
      .then( promiseArray => {
        console.log(promiseArray)
        Promise.all(promiseArray)
          .then( resultArray => {
            console.log(resultArray)
            dispatch({
              payload: { filesMeta: resultArray, loading: false, selectedFolder: path, collectionType: collectionType },
              type: CHANGE_REPO_STATE
            })
          })
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

export function fileAdded(name, path) {
  return dispatch => {
    dispatch({
      payload: {name, path},
      type: FILE_ADDED
    })
  }
}

export function fileReplaced(name, oldPath, newPath) {
  return dispatch => {
    dispatch({
      payload: { name, oldPath, newPath },
      type: FILE_REPLACED
    })
  }
}

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
      dispatch(fetchBranchSchema(branch)),
      dispatch({
        payload: { currentBranch: branch },
        type: CHANGE_REPO_STATE
      }),
      dispatch(cleanEditor())
    ])
  }
}

export function fetchBranchSchema(branch) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })

    return getBranchSchema({ branch, path: '_schemas'})
      .then(data => {
        dispatch({
          payload: { schema: data, loading: false },
          type: CHANGE_REPO_STATE
        })
      })
      .catch(err => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_REPO_STATE
        })
      })
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

export function resetRepoData () {
  return dispatch => {
    dispatch({
      type: RESET_REPO_DATA
    })
  }
}

export function selectCollectionFile(item) {
  return dispatch => {
    dispatch({
      payload: {selectedCollectionFile: item},
      type: CHANGE_REPO_STATE
    })
  }
}
