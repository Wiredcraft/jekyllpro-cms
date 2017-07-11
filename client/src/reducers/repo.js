import Immutable from 'immutable'

import {
  CHANGE_REPO_STATE,
  FILE_REMOVED,
  FILE_ADDED,
  FILE_REPLACED,
  RESET_REPO_DATA,
  CHECKOUT_BRANCH,
  COLLECTION_FILE_ADDED,
  COLLECTION_FILE_REMOVED,
  COLLECTION_FILE_UPDATED,
  UPDATE_COLLECTION_COMPLETED
} from '../actions/repoActions'

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
  repoUpdateSignal: false,
  indexFetchStatus: undefined,
})

export default function repo (state = initialState, action) {
  switch (action.type) {
    case RESET_REPO_DATA:
      return initialState

    case CHANGE_REPO_STATE:
      return state.merge(action.payload)

    case CHECKOUT_BRANCH:
      return state.merge({
        currentBranch: action.payload.currentBranch,
        currentBranchUpdatedAt: undefined,
        collections: undefined,
        schemas: undefined,
        config: undefined,
        indexUpdatedAt: undefined,
        treeMeta: undefined,
        indexFetchStatus: undefined
      })

    case FILE_REMOVED:
      var { path } = action.payload
      let removedTreeMeta = state.get('treeMeta')
      removedTreeMeta = removedTreeMeta.delete(
        removedTreeMeta.findIndex(item => {return item.get('path') === path})
      )
      return state.merge({
        'treeMeta': removedTreeMeta
      })

    case FILE_ADDED:
      var { path } = action.payload
      let addedTreeMeta = state.get('treeMeta').push(Immutable.Map({ type: 'blob', path: path }))

      return state.merge({
        'treeMeta': addedTreeMeta
      })

    case FILE_REPLACED:
      var { oldPath, newPath } = action.payload
      let updatedTreeMeta = state.get('treeMeta')
      
      updatedTreeMeta = updatedTreeMeta.update(
        updatedTreeMeta.findIndex((item) => {return item.get('path') === oldPath}),
        (matched) => {return matched.set('path', newPath)}
      )
      return state.merge({
        'treeMeta': updatedTreeMeta
      })

    case COLLECTION_FILE_ADDED:
      let addingCol = state.get('collections').push(Immutable.Map(action.payload.newFileData))
      return state.merge({
        'collections': addingCol,
        'repoUpdateSignal': true
      })

    case COLLECTION_FILE_REMOVED:
      let removingCol = state.get('collections')
      removingCol = removingCol.delete(
        removingCol.findIndex(i => {return i.get('path') === action.payload.path})
      )
      return state.merge({
        'collections': removingCol,
        'repoUpdateSignal': true
      })

    case COLLECTION_FILE_UPDATED:
      var { oldPath, newFileData } = action.payload
      let updatingCol = state.get('collections')

      updatingCol = updatingCol.update(
        updatingCol.findIndex(i => {return i.get('path') === oldPath}),
        () => {return Immutable.Map(newFileData)}
      )
      return state.merge({
        'collections': updatingCol,
        'repoUpdateSignal': true
      })

    case UPDATE_COLLECTION_COMPLETED: {
      const { modified, removed } = action.payload;

      let newCollections = state.get('collections'); // to track immutable List
      modified.forEach(c => {
        const idx = newCollections.findIndex(val => val.get('path') === c.path);
        if (idx === -1) {
          // this is a new entry
          newCollections = newCollections.push(Immutable.Map(c));
        } else {
          // update existed entry
          newCollections = newCollections.update(idx, _val => Immutable.Map(c));
        }
      });

      removed.forEach(c => {
        const idx = newCollections.findIndex(val => val.get('path') === c.path);
        newCollections = newCollections.delete(idx);
      });
      return state
        .set('collections', newCollections)
        .set('repoUpdateSignal', true);
    }

    default:
      return state
  }
}
