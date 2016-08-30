import Immutable from 'immutable'

const initialState = Immutable.fromJS({
  isLogin: false,
  userName: ''
})

export default function user (state = initialState, action) {
  switch (action.type) {
  default:
    return state
  }
}
