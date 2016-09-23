/* global API_BASE_URL */
import request from 'superagent'
import { push } from 'react-router-redux'

import { parseFilesMeta } from '../helpers/repo'
import { fetchDefaultSchema, cleanEditor } from './editorActions'

export const CHANGE_REPO_STATE = 'CHANGE_REPO_STATE'
export const FILE_REMOVED = 'FILE_REMOVED'
export const FILE_ADDED = 'FILE_ADDED'
export const FILE_REPLACED = 'FILE_REPLACED'

export function fetchRepoInfo() {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/repository/details`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          dispatch({
            payload: {currentBranch: res.body.default_branch, repoName: res.body.full_name},
            type: CHANGE_REPO_STATE
          })
        }
      })
  }
}

export function fetchFilesMeta(branch, path, collectionType) {
  let url = branch ? `${API_BASE_URL}/api/repository?ref=${branch}&path=${path}` : `${API_BASE_URL}/api/repository?path=${path}`

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
    dispatch(push(`/${collectionType}/${branch}/`))

    request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
          dispatch({
            payload: { loading: false, filesMeta: [], selectedFolder: path, collectionType },
            type: CHANGE_REPO_STATE
          })
        } else {
          const filesMeta = parseFilesMeta(res.body)
          dispatch({
            payload: { filesMeta, collectionType, loading: false, selectedFolder: path },
            type: CHANGE_REPO_STATE
          })
        }
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
    dispatch(push(`/pages/${branch}/`))

    request
      .get(`${API_BASE_URL}/api/repository?ref=${branch}`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
          return dispatch({
            payload: { loading: false, filesMeta: [], selectedFolder: 'pages' },
            type: CHANGE_REPO_STATE
          })
        }
        var branchData = res.body
        pages = branchData.filter( item => {
          return (item.type === 'file') && (/\.(html|HTML)$/.test(item.name))
        })
        pages = parseFilesMeta(pages)

        var folderRequests = branchData.filter( item => {
          return (item.type === 'dir') && (/^[a-zA-Z0-9]/.test(item.name))
        }).map( dir => {
          return new Promise((resolve, reject) => {
            request
              .get(`${API_BASE_URL}/api/repository?ref=${branch}&path=${dir.path}`)
              .withCredentials()
              .end((err, res) => {
                if (err) {
                  console.log(err)
                  return resolve({name: dir.name})
                }
                var dirData = res.body.filter( item => {
                  return (item.type === 'file') && (/\.(html|HTML)$/.test(item.name))
                })
                if (dirData.length === 0) {
                  return resolve({name: dir.name})
                }
                dirData = parseFilesMeta(dirData)
                return resolve({name: dir.name, children: dirData})
              })
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
  }
}

const makeRequest = (branch, path) => {
  return new Promise((resolve, reject) => {
    request
      .get(`${API_BASE_URL}/api/repository?ref=${branch}&path=${path}`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res.body)
      })     
  })
}
const makeNestedRequest = (branch, path, name) => {
  return makeRequest(branch, path)
    .then(list => {
      return list.map((item) => {
        if (item.type === 'file') {
          return Promise.resolve({ name: item.name, path: item.path, url: item.url })
        }
        if (item.type === 'dir') {
          var dirRequest = makeRequest(branch, item.path)
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
    dispatch(push(`/${collectionType}/${branch}/${path}`))

    makeNestedRequest(branch, path, path)
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

export function checkoutBranch({ collectionType, splat: filePath}, branch) {
  return dispatch => {
    console.log('checkoutBranch')
    Promise.all([
      dispatch(fetchBranchSchema(branch)),
      dispatch(
        push(`/${collectionType || 'pages'}/${branch}/${filePath || ''}`)),
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

    let url = branch
      ? `${API_BASE_URL}/api/repository/schema?ref=${branch}&path=_schemas`
      : `${API_BASE_URL}/api/repository/schema?path=_schemas`

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
          dispatch({
            payload: { schema: res.body, loading: false },
            type: CHANGE_REPO_STATE
          })
        }
      })
  }
}

export function isBranchPrivate(branch) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_REPO_STATE
    })

    return new Promise((resolve, reject) => {
      request
        .get(`${API_BASE_URL}/api/repository?ref=${branch}&path=PROTECTED&raw=true`)
        .withCredentials()
        .end((err, res) => {
          if (err) {
            console.error(err)
            dispatch({
              payload: { loading: false },
              type: CHANGE_REPO_STATE
            })
            if (err.statusCode === 404) {
              resolve({isPrivate: false})
            } else {
              reject('error')
            }

          } else {
            dispatch({
              payload: { loading: false },
              type: CHANGE_REPO_STATE
            })
            resolve({isPrivate: true})
          }
        })
    })
  }
}

