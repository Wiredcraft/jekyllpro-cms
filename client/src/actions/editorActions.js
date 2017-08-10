/* global API_BASE_URL */
import { getRepoMeta, updateRepoFile, deleteRepoFile } from '../helpers/api';
import { fileRemoved, fileAdded, fileReplaced } from './repoActions';

export const CHANGE_EDITOR_STATE = 'CHANGE_EDITOR_STATE';
export const RESET_EDITOR_DATA = 'RESET_EDITOR_DATA';

export function updatingEditor(promiseObj) {
  return dispatch => {
    dispatch({
      payload: { loading: true },
      type: CHANGE_EDITOR_STATE
    });
    return promiseObj
      .then(response => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_EDITOR_STATE
        });
        return response;
      })
      .catch(err => {
        dispatch({
          payload: { loading: false },
          type: CHANGE_EDITOR_STATE
        });
      });
  };
}

export function addNewFile(branch, path, content, options) {
  return dispatch => {
    return updateRepoFile({
      branch,
      path,
      content,
      message: `add ${path}`,
      options
    });
  };
}

export function deleteFile(branch, path) {
  return dispatch => {
    return deleteRepoFile({ branch, path });
  };
}

export function updateFile(branch, path, content, options) {
  return dispatch => {
    return updateRepoFile({ branch, path, content, options });
  };
}

export function replaceFile(branch, oldPath, newPath, content, options) {
  return dispatch => {
    return updateRepoFile({
      branch,
      path: newPath,
      content,
      options
    }).then(res => {
      deleteRepoFile({ branch: branch, path: oldPath });
      return res;
    });
  };
}

export function resetEditorData() {
  return dispatch => {
    dispatch({
      type: RESET_EDITOR_DATA
    });
  };
}

export function changeEditorMode(mode) {
  return dispatch => {
    dispatch({
      payload: { mode },
      type: CHANGE_EDITOR_STATE
    });
  };
}

export function selectCollectionFile(item) {
  return dispatch => {
    dispatch({
      payload: { selectedCollectionFile: item },
      type: CHANGE_EDITOR_STATE
    });
  };
}
