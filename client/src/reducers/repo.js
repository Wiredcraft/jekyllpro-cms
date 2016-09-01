import Immutable from 'immutable'

import { CHANGE_REPO_STATE } from '../actions/repoActions'

const initialState = Immutable.fromJS({
  branches: undefined
})

export default function user (state = initialState, action) {
  switch (action.type) {
  case CHANGE_REPO_STATE:
    const { branches } = action.payload
    if(branches) state = state.set('branches', branches)
    return state
  default:
    return state
  }
}
