import React, { Component } from 'react';
import { connect } from 'react-redux';

import NoSchema from 'components/common/NoSchema';
import InvalidRepo from 'components/common/InvalidRepo';
import MainCL from './MainCL';
import AltCL from './AltCL';

class ContentListing extends Component {
  render() {
    const { params, pathname, config, query, repoFullName } = this.props;

    if (query && query.invalidRepo === '1') {
      return <InvalidRepo />;
    }
    if (query && query.noSchema === '1') {
      return <NoSchema repoFullName={repoFullName} />;
    }

    if (config && config.custom_nav && config.nav_menu) {
      return <AltCL params={params} pathname={pathname} query={query} />;
    }

    return <MainCL params={params} pathname={pathname} query={query} />;
  }
}

function mapStateToProps(
  state,
  { params: { repoOwner, repoName }, location: { pathname, query } }
) {
  var repoState = state.repo.toJSON();
  return {
    repoFullName: `${repoOwner}/${repoName}`,
    query: query,
    pathname: pathname,
    config: repoState.config
  };
}

export default connect(mapStateToProps)(ContentListing);
