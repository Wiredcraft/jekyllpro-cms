import Immutable from 'immutable'

const initialState = Immutable.fromJS({
  isLoading: false
})

export default function app (state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}
