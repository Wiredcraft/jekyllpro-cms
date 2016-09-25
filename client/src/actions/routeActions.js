import { push } from 'react-router-redux'

export function toRoute (routingUrl) {
  return dispatch => {
    dispatch(push(routingUrl))
  }
}