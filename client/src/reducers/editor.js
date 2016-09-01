import Immutable from 'immutable'

import { CHANGE_EDITOR_STATE } from '../actions/editorActions'

const initialState = Immutable.fromJS({
  schema: undefined,
  content: undefined
})

export default function repo (state = initialState, action) {
  switch (action.type) {
  case CHANGE_EDITOR_STATE:
    const { content, schema } = action.payload
    if(content) state = state.set('content', content)
    if(schema) state = state.set('schema', schema)
    return state
  default:
    return state
  }
}
