import Immutable from 'immutable'

import { CHANGE_REPO_STATE } from '../actions/repoActions'

const initialState = Immutable.fromJS({
  branches: undefined,
  schemas: undefined
})

export default function repo (state = initialState, action) {
  switch (action.type) {
  case CHANGE_REPO_STATE:
    const { branches, schemas } = action.payload
    if(branches) state = state.set('branches', branches)
    if(schemas) state = state.set('schemas', schemas)
    return state
  default:
    return state
  }
}
