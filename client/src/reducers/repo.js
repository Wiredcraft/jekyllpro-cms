import Immutable from 'immutable'

import { CHANGE_REPO_STATE, FILE_REMOVED, FILE_ADDED, FILE_REPLACED } from '../actions/repoActions'

const initialState = Immutable.fromJS({
  branches: undefined,
  currentBranch: undefined,
  filesMeta: undefined,
  pagesMeta: undefined,
  loading: false,
  schema: undefined,
  selectedFolder: undefined
})

export default function repo (state = initialState, action) {
  var updatedFileMeta;

  switch (action.type) {
  case CHANGE_REPO_STATE:
    var { branches, filesMeta, currentBranch, loading, schema, selectedFolder, pagesMeta } = action.payload
    if(branches) state = state.set('branches', branches)
    if(selectedFolder) state = state.set('selectedFolder', selectedFolder)
    if(filesMeta) state = state.set('filesMeta', filesMeta)
    if(currentBranch) state = state.set('currentBranch', currentBranch)
    if(loading !== undefined) state = state.set('loading', loading)
    if(schema) state = state.set('schema', schema)
    if(pagesMeta) state = state.set('pagesMeta', pagesMeta)
    return state
  case FILE_REMOVED:
    var { path } = action.payload
    updatedFileMeta = state.get('filesMeta')
    updatedFileMeta = updatedFileMeta.filter((item) => {
      return item.path !== path
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
    var i = updatedFileMeta.findIndex((item) => {
      return item.path === oldPath
    })
    updatedFileMeta[i] = {name: name, path: newPath}
    updatedFileMeta = Object.assign([], updatedFileMeta)
    state = state.set('filesMeta', updatedFileMeta)
    return state  
  default:
    return state
  }
}
