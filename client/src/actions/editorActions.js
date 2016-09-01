/* global API_BASE_URL */
import request from 'superagent'


export const CHANGE_EDITOR_STATE = 'CHANGE_EDITOR_STATE'

// TODO remove this hard coding, fetch config based on current selected collection
export function fetchDefaultSchema() {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/repository?path=_schema/posts.json`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          dispatch({
            payload: { schema: JSON.parse(atob(res.body.content)) },
            type: CHANGE_EDITOR_STATE
          })
        }
      })
  }
}

export function fetchFileContent(path, index) {
  return dispatch => {
    request
      .get(`${API_BASE_URL}/api/repository?path=${path}&raw=true`)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          dispatch({
            payload: { content: res.body, fileIndex: index },
            type: CHANGE_EDITOR_STATE
          })
        }
      })
  }
}
