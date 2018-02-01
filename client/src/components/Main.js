/* global API_BASE_URL */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { NotificationContainer } from 'react-notifications';

import { confirmUserIsLogged } from '../actions/userActions';
import { toRoute, replaceRoute } from '../actions/routeActions';
import Header from './Header';
import WaitingIndexUpdate from './common/WaitingIndexUpdate';
import Cookie from 'js-cookie';
import { queryToUrlString } from '../helpers/utils';
import 'codemirror/lib/codemirror.css';
import 'react-notifications/lib/notifications.css';
import '../styles/_sass/main.scss';
import '../styles/_supplement.scss';
import 'react-select/dist/react-select.css';

@connect(mapStateToProps, mapDispatchToProps)
export default class AppComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {
      confirmUserIsLogged,
      toRoute,
      replaceRoute,
      location: { pathname, query }
    } = this.props;
    delete query.redirect_to;

    confirmUserIsLogged().catch(err => {
      replaceRoute({
        pathname: '/login',
        query: { redirect_to: pathname + queryToUrlString(query) }
      });
    });
  }

  render() {
    const {
      isLoggedIn,
      userLoaded,
      repoLoading,
      indexFetchStatus,
      location: { pathname }
    } = this.props;

    return isLoggedIn && pathname !== '/select'
      ? <div id="app" className={repoLoading ? 'loading' : ''}>
          <Header params={this.props.params} location={this.props.location} />
          {indexFetchStatus && <WaitingIndexUpdate status={indexFetchStatus} />}
          {this.props.children}
          <NotificationContainer />
        </div>
      : <div id="landing" className={userLoaded ? '' : 'coating'}>
          {this.props.children}
        </div>;
  }
}

function mapStateToProps(state) {
  var repoStatus = state.repo.toJSON();
  var userStatus = state.user.toJSON();
  return {
    repoLoading: repoStatus.loading,
    indexFetchStatus: repoStatus.indexFetchStatus,
    userLoaded: userStatus.loaded,
    isLoggedIn: userStatus.isLoggedIn
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { confirmUserIsLogged, toRoute, replaceRoute },
    dispatch
  );
}
