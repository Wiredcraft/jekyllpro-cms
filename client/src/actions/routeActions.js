import { push, replace } from 'react-router-redux'

export function toRoute (routingUrl) {
  return dispatch => {
    dispatch(push(routingUrl))
  }
}

export function replaceRoute (routingUrl) {
  return dispatch => {
    dispatch(replace(routingUrl))
  }
}
