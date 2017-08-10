/* global API_BASE_URL */
import { getUser, logoutUser } from '../helpers/api';
import { resetEditorData } from './editorActions';
import { resetRepoData } from './repoActions';

export const CHANGE_LOGIN_STATE = 'CHANGE_LOGIN_STATE';
export const USER_LOG_OUT = 'USER_LOG_OUT';

export function confirmUserIsLogged() {
  return dispatch => {
    return getUser()
      .then(data => {
        dispatch({
          type: CHANGE_LOGIN_STATE,
          payload: {
            loaded: true,
            isLoggedIn: true,
            userName: data.login,
            avatar: data.avatar_url,
            userUrl: data.html_url
          }
        });
        return Promise.resolve();
      })
      .catch(err => {
        dispatch({
          type: CHANGE_LOGIN_STATE,
          payload: { loaded: true }
        });
        return Promise.reject();
      });
  };
}

export function logout() {
  return dispatch => {
    return logoutUser().then(() => {
      return Promise.all([
        dispatch(resetRepoData),
        dispatch(resetEditorData),
        dispatch({
          type: USER_LOG_OUT
        })
      ]);
    });
  };
}
