import Immutable from 'immutable'

import { CHANGE_REPO_STATE, FILE_REMOVED, FILE_ADDED } from '../actions/repoActions'

const initialState = Immutable.fromJS({
  branches: undefined,
  filesMeta: undefined
})

export default function repo (state = initialState, action) {
  switch (action.type) {
  case CHANGE_REPO_STATE:
    const { branches, filesMeta } = action.payload
    if(branches) state = state.set('branches', branches)
    if(filesMeta) state = state.set('filesMeta', filesMeta)
    return state
  case FILE_REMOVED:
    const { fileIndex } = action.payload
    let updatedFileMeta = state.get('filesMeta')
    updatedFileMeta = updatedFileMeta.splice(fileIndex, 1)
    state = state.set('filesMeta', updatedFileMeta)
    return state
  case FILE_ADDED:
    const { name, path } = action.payload
    let newFileMeta = state.get('filesMeta')
    newFileMeta.push({name: name, path: path})
    newFileMeta = Object.assign([], newFileMeta)
    state = state.set('filesMeta', newFileMeta)
    return state  
  default:
    return state
  }
}
