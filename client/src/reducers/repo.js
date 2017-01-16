import Immutable from 'immutable'

import { CHANGE_REPO_STATE, FILE_REMOVED, FILE_ADDED, FILE_REPLACED, RESET_REPO_DATA, CHECKOUT_BRANCH,
  COLLECTION_FILE_ADDED, COLLECTION_FILE_REMOVED, COLLECTION_FILE_UPDATED } from '../actions/repoActions'

const initialState = Immutable.fromJS({
  loading: false,
  branches: undefined,
  repoDetails: undefined,
  currentBranch: undefined,
  currentBranchUpdatedAt: undefined,
  collections: undefined,
  schemas: undefined,
  config: undefined,
  indexUpdatedAt: undefined,
  treeMeta: undefined,
  hasIndexHook: false,
  repoUpdateSignal: false
})

export default function repo (state = initialState, action) {
  var updatedTreeMeta;

  switch (action.type) {
    case RESET_REPO_DATA:
      return initialState

    case CHANGE_REPO_STATE:
      var { branches, treeMeta, currentBranch, loading, repoDetails, currentBranchUpdatedAt,
        config, collections, schemas, hasIndexHook, repoUpdateSignal, indexUpdatedAt } = action.payload
      if(repoDetails) state = state.set('repoDetails', repoDetails)
      if(branches) state = state.set('branches', branches)
      if(currentBranch) state = state.set('currentBranch', currentBranch)
      if(currentBranchUpdatedAt) state = state.set('currentBranchUpdatedAt', currentBranchUpdatedAt)
      if(loading !== undefined) state = state.set('loading', loading)
      if(schemas) state = state.set('schemas', schemas)
      if(config) state = state.set('config', config)
      if(collections) state = state.set('collections', collections)
      if(indexUpdatedAt) state = state.set('indexUpdatedAt', indexUpdatedAt)
      if(treeMeta) state = state.set('treeMeta', treeMeta)
      if(hasIndexHook) state = state.set('hasIndexHook', hasIndexHook)
      if(repoUpdateSignal) state = state.set('repoUpdateSignal', repoUpdateSignal)
      return state

    case CHECKOUT_BRANCH:
      return state.merge({
        currentBranch: action.payload.currentBranch,
        currentBranchUpdatedAt: undefined,
        collections: undefined,
        schemas: undefined,
        config: undefined,
        indexUpdatedAt: undefined,
        treeMeta: undefined
      })

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
      updatedTreeMeta = [...state.get('treeMeta'), { type: 'blob', path: path }]
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
      let addingCol = [...state.get('collections'), action.payload.newFileData]
      state = state.set('collections', addingCol).set('repoUpdateSignal', true)
      return state

    case COLLECTION_FILE_REMOVED:
      let removingCol = state.get('collections').filter(i => {
        return i.path !== action.payload.path
      })
      state = state.set('collections', removingCol).set('repoUpdateSignal', true)
      return state

    case COLLECTION_FILE_UPDATED:
      var { oldPath, newFileData } = action.payload
      let updatingCol = state.get('collections').map(i => {
        if (i.path === oldPath) {
          return newFileData
        }
        return i
      })
      state = state.set('collections', updatingCol).set('repoUpdateSignal', true)
      return state

    default:
      return state
  }
}
