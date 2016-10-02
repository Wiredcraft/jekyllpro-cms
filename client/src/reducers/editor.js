import Immutable from 'immutable'

import { CHANGE_EDITOR_STATE, NEW_EMPTY_FILE, DELETE_EXISTING_FILE, CLEAN_EDITOR, RESET_EDITOR_DATA } from '../actions/editorActions'

const initialState = Immutable.fromJS({
  schema: undefined,
  content: undefined,
  targetFileIndex: undefined,
  targetFile: undefined,
  newFileMode: false,
  loading: false
})

export default function repo (state = initialState, action) {
  switch (action.type) {
    case RESET_EDITOR_DATA:
      return initialState
    case CHANGE_EDITOR_STATE:
      const { content, fileIndex, schema, loading, targetFile } = action.payload
      if (content !== undefined) state = state.set('content', content)
      if(schema !== undefined) state = state.set('schema', schema)
      if(targetFile !== undefined) state = state.set('targetFile', targetFile)
      if (state.get('newFileMode')) state = state.set('newFileMode', false)
      if(loading !== undefined) state = state.set('loading', loading)
      return state
    case NEW_EMPTY_FILE:
      state = state.set('newFileMode', true)
      state = state.set('content', undefined)
      return state
    case DELETE_EXISTING_FILE:
      state = state.set('content', undefined)
      state = state.set('newFileMode', false)
      state = state.set('targetFile', undefined)
      return state
    case CLEAN_EDITOR:
      state = state.set('content', undefined)
      state = state.set('newFileMode', false)
      state = state.set('targetFile', undefined)
      return state
    default:
      return state
  }
}
