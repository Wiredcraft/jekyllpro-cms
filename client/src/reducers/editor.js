import Immutable from 'immutable'

import { CHANGE_EDITOR_STATE, NEW_EMPTY_FILE, DELETE_EXISTING_FILE } from '../actions/editorActions'

const initialState = Immutable.fromJS({
  schema: undefined,
  content: undefined,
  targetFileIndex: undefined,
  newFileMode: false
})

export default function repo (state = initialState, action) {
  switch (action.type) {
  case CHANGE_EDITOR_STATE:
    const { content, fileIndex, schema } = action.payload
    state = state.set('content', content)
    if(schema !== undefined) state = state.set('schema', schema)
    if(fileIndex !== undefined) state = state.set('targetFileIndex', fileIndex)
    if (state.get('newFileMode')) state = state.set('newFileMode', false)
    return state
  case NEW_EMPTY_FILE:
    state = state.set('newFileMode', true)
    state = state.set('content', undefined)
    return state
  case DELETE_EXISTING_FILE:
    state = state.set('content', undefined)
    state = state.set('newFileMode', false)
    state = state.set('targetFileIndex', undefined)
    return state
  default:
    return state
  }
}
