export const CHANGE_NAV_STATE = 'CHANGE_NAV_STATE';
export const RESET_NAV_STATE = 'RESET_NAV_STATE';

export function setNavPath(menuPath, menuMeta) {
  return dispatch => {
    dispatch({
      payload: { menuPath, menuMeta },
      type: CHANGE_NAV_STATE
    });
  };
}

export function resetNav() {
  return dispatch => {
    dispatch({
      type: RESET_NAV_STATE
    });
  };
}
