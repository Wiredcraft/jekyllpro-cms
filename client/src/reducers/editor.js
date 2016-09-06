import Immutable from 'immutable'

import { CHANGE_EDITOR_STATE, NEW_EMPTY_FILE } from '../actions/editorActions'

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
    if(content !== undefined) state = state.set('content', content)
    if(schema !== undefined) state = state.set('schema', schema)
    if(fileIndex !== undefined) state = state.set('targetFileIndex', fileIndex)
    return state
  case NEW_EMPTY_FILE:
    state = state.set('newFileMode', true)
    state = state.set('content', undefined)
    return state
  default:
    return state
  }
}
