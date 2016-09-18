import Immutable from 'immutable'

import { CHANGE_REPO_STATE, FILE_REMOVED, FILE_ADDED, FILE_REPLACED } from '../actions/repoActions'

const initialState = Immutable.fromJS({
  branches: undefined,
  currentBranch: undefined,
  filesMeta: undefined,
  loading: false,
  schema: undefined,
  selectedFolder: undefined
})

export default function repo (state = initialState, action) {
  var updatedFileMeta;

  switch (action.type) {
  case CHANGE_REPO_STATE:
    var { branches, filesMeta, currentBranch, loading, schema, selectedFolder } = action.payload
    if(branches) state = state.set('branches', branches)
    if(selectedFolder) state = state.set('selectedFolder', selectedFolder)
    if(filesMeta) state = state.set('filesMeta', filesMeta)
    if(currentBranch) state = state.set('currentBranch', currentBranch)
    if(loading !== undefined) state = state.set('loading', loading)
    if(schema) state = state.set('schema', schema)
    return state
  case FILE_REMOVED:
    var { fileIndex } = action.payload
    updatedFileMeta = state.get('filesMeta')
    updatedFileMeta.splice(fileIndex, 1)
    updatedFileMeta = Object.assign([], updatedFileMeta)
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
    var { name, path, fileIndex } = action.payload
    updatedFileMeta = state.get('filesMeta')
    updatedFileMeta[fileIndex] = {name: name, path: path}
    updatedFileMeta = Object.assign([], updatedFileMeta)
    state = state.set('filesMeta', updatedFileMeta)
    return state  
  default:
    return state
  }
}
