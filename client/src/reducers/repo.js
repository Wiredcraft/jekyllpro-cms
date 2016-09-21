import Immutable from 'immutable'

import { CHANGE_REPO_STATE, FILE_REMOVED, FILE_ADDED, FILE_REPLACED } from '../actions/repoActions'

const initialState = Immutable.fromJS({
  branches: undefined,
  currentBranch: undefined,
  repoName: undefined,
  filesMeta: undefined,
  loading: false,
  schema: undefined,
  selectedFolder: undefined,
  collectionType: undefined
})

export default function repo (state = initialState, action) {
  var updatedFileMeta;

  switch (action.type) {
  case CHANGE_REPO_STATE:
    var { branches, filesMeta, currentBranch, loading, schema, selectedFolder, repoName, collectionType } = action.payload
    if(branches) state = state.set('branches', branches)
    if(selectedFolder) state = state.set('selectedFolder', selectedFolder)
    if(filesMeta) state = state.set('filesMeta', filesMeta)
    if(currentBranch) state = state.set('currentBranch', currentBranch)
    if(loading !== undefined) state = state.set('loading', loading)
    if(schema) state = state.set('schema', schema)
    if(repoName) state = state.set('repoName', repoName)
    if(collectionType) state = state.set('collectionType', collectionType)
    return state
  case FILE_REMOVED:
    var { path } = action.payload
    updatedFileMeta = state.get('filesMeta')
    updatedFileMeta.forEach((item) => {
      if (item.children) {
        item.children = item.children.filter((i) => {
          return i.path !== path
        })
      }   
    })
    updatedFileMeta = updatedFileMeta.filter((item) => {
      if (item.path) {
        return item.path !== path
      }
      return true
    })
    state = state.set('filesMeta', updatedFileMeta)
    return state
  case FILE_ADDED:
    var { name, path } = action.payload
    updatedFileMeta = state.get('filesMeta')
    updatedFileMeta.push({name: name, path: path})
    updatedFileMeta = Object.assign([], updatedFileMeta)
    state = state.set('filesMeta', updatedFileMeta)
    return state
  case FILE_REPLACED:
    var { name, oldPath, newPath } = action.payload
    updatedFileMeta = state.get('filesMeta')
    updatedFileMeta = updatedFileMeta.map((item, i) => {
      if (item.path && item.path === oldPath) {
        return {name: name, path: newPath}
      } else if (item.children) {
        item.children = item.children.map((i) => {
          if (i.path === oldPath) {
            return {name: name, path: newPath}
          } else {
            return i
          }
        })
        return item
      } else {
        return item
      }
    })
    state = state.set('filesMeta', updatedFileMeta)
    return state  
  default:
    return state
  }
}
