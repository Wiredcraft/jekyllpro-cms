import Immutable from 'immutable';

import { CHANGE_NAV_STATE, RESET_NAV_STATE } from '../actions/navActions';

const initialState = Immutable.fromJS({
  menuPath: undefined,
  menuMeta: undefined
});

export default function nav(state = initialState, action) {
  switch (action.type) {
    case RESET_NAV_STATE:
      return initialState;

    case CHANGE_NAV_STATE:
      return state.merge(action.payload);

    default:
      return state;
  }
}
