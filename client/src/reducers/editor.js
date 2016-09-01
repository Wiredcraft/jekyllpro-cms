import Immutable from 'immutable'

import { CHANGE_EDITOR_STATE } from '../actions/editorActions'

const initialState = Immutable.fromJS({
  schema: undefined,
  content: undefined,
  targetFileIndex: undefined
})

export default function repo (state = initialState, action) {
  switch (action.type) {
  case CHANGE_EDITOR_STATE:
    const { content, fileIndex, schema } = action.payload
    if(content !== undefined) state = state.set('content', content)
    if(schema !== undefined) state = state.set('schema', schema)
    if(fileIndex !== undefined) state = state.set('targetFileIndex', fileIndex)
    return state
  default:
    return state
  }
}
