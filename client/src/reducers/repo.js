import Immutable from 'immutable'

import { CHANGE_REPO_STATE, FILE_REMOVED, FILE_ADDED, FILE_REPLACED, RESET_REPO_DATA,
  COLLECTION_FILE_ADDED, COLLECTION_FILE_REMOVED, COLLECTION_FILE_UPDATED } from '../actions/repoActions'

const initialState = Immutable.fromJS({
  branches: undefined,
  currentBranch: undefined,
  repoName: undefined,
  loading: false,
  collections: undefined,
  schemas: undefined,
  treeMeta: undefined,
  hasIndexHook: false
})

export default function repo (state = initialState, action) {
  var updatedTreeMeta;

  switch (action.type) {
    case RESET_REPO_DATA:
      return initialState

    case CHANGE_REPO_STATE:
      var { branches, treeMeta, currentBranch, loading, repoName, collections, schemas, hasIndexHook } = action.payload
      if(branches) state = state.set('branches', branches)
      if(currentBranch) state = state.set('currentBranch', currentBranch)
      if(loading !== undefined) state = state.set('loading', loading)
      if(repoName) state = state.set('repoName', repoName)
      if(schemas) state = state.set('schemas', schemas)
      if(collections) state = state.set('collections', collections)
      if(treeMeta) state = state.set('treeMeta', treeMeta)
      if(hasIndexHook) state = state.set('hasIndexHook', hasIndexHook)
      return state

    case FILE_REMOVED:
      var { path } = action.payload
      updatedTreeMeta = state.get('treeMeta')
      updatedTreeMeta = updatedTreeMeta.filter((item) => {
        return item.path !== path
      })
      state = state.set('treeMeta', updatedTreeMeta)
      return state

    case FILE_ADDED:
      var { path } = action.payload
      updatedTreeMeta = state.get('treeMeta').push({ type: 'blob', path: path })
      // updatedTreeMeta = Object.assign([], updatedTreeMeta)
      state = state.set('treeMeta', updatedTreeMeta)
      return state

    case FILE_REPLACED:
      var { oldPath, newPath } = action.payload
      updatedTreeMeta = state.get('treeMeta').map((item, i) => {
        if (item.path && item.path === oldPath) {
          return Object.assign(item, { path: newPath })
        } else {
          return item
        }
      })
      state = state.set('treeMeta', updatedTreeMeta)
      return state

    case COLLECTION_FILE_ADDED:
      let addingCol = state.get('collections').push(action.payload.newFileData)
      state = state.set('collections', addingCol)
      return state

    case COLLECTION_FILE_REMOVED:
      let removingCol = state.get('collections').filter(i => {
        return i.path !== action.payload.path
      })
      state = state.set('collections', removingCol)
      return state

    case COLLECTION_FILE_UPDATED:
      var { oldPath, newFileData } = action.payload
      let updatingCol = state.get('collections').map(i => {
        if (i.path === oldPath) {
          return newFileData
        }
        return i
      })
      state = state.set('collections', updatingCol)
      return state

    default:
      return state
  }
}
