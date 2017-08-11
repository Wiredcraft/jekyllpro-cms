import Immutable from 'immutable';

import {
  CHANGE_EDITOR_STATE,
  EDITOR_NEW_FILE,
  EDITOR_SELECTED_FILE,
  RESET_EDITOR_DATA
} from '../actions/editorActions';

const initialState = Immutable.fromJS({
  loading: false,
  selectedCollectionFile: undefined,
  defaultValues: undefined
});

export default function repo(state = initialState, action) {
  switch (action.type) {
    case RESET_EDITOR_DATA:
      return initialState;

    case CHANGE_EDITOR_STATE:
      return state.merge(action.payload);

    case EDITOR_NEW_FILE:
      return state.merge({
        selectedCollectionFile: undefined,
        defaultValues: action.payload
      });

    case EDITOR_SELECTED_FILE:
      return state.merge({
        selectedCollectionFile: action.payload,
        defaultValues: undefined
      });

    default:
      return state;
  }
}
