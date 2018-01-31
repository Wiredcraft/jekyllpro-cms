import Immutable from 'immutable'

import {
  CHANGE_EDITOR_STATE,
  RESET_EDITOR_DATA
} from '../actions/editorActions'

const initialState = Immutable.fromJS({
  loading: false,
  selectedCollectionFile: undefined,
  mode: undefined
})

export default function repo (state = initialState, action) {
  switch (action.type) {
    case RESET_EDITOR_DATA:
      return initialState

    case CHANGE_EDITOR_STATE:
      return state.merge(action.payload)

    default:
      return state
  }
}
