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
  treeMeta: undefined
})

export default function repo (state = initialState, action) {
  var updatedFileMeta;

  switch (action.type) {
    case RESET_REPO_DATA:
      return initialState
    case CHANGE_REPO_STATE:
      var { branches, treeMeta, currentBranch, loading, repoName, collections, schemas } = action.payload
      if(branches) state = state.set('branches', branches)
      if(currentBranch) state = state.set('currentBranch', currentBranch)
      if(loading !== undefined) state = state.set('loading', loading)
      if(repoName) state = state.set('repoName', repoName)
      if(schemas) state = state.set('schemas', schemas)
      if(collections) state = state.set('collections', collections)
      if(treeMeta) state = state.set('treeMeta', treeMeta)
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
      var pathArray = path.split('/')
      updatedFileMeta = state.get('filesMeta')

      if (pathArray.length <= 2) {      
        updatedFileMeta.push({name: name, path: path})
      } else {
        // file is in subfolder
        var folderName = pathArray[1]
        var fileName = pathArray[pathArray.length - 1]
        var matchedFolderIdx = updatedFileMeta.findIndex((item, i) => {
          return (item.name === folderName)
        })
        if (matchedFolderIdx > -1) {
          updatedFileMeta[matchedFolderIdx].children.push({name: fileName, path: path})
        } else {
          updatedFileMeta.push({name: folderName, children: [{name: fileName, path: path}]})
        }
      }

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
