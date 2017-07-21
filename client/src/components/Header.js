import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';
import Cookie from 'js-cookie';

import {
  getAllBranch,
  checkoutBranch,
  fetchRepoInfo,
  resetRepoData,
  fetchRepoIndex,
  fetchUpdatedCollections,
  resetUpdateSignal,
  retryIndexFetchRequest
} from '../actions/repoActions';
import {
  resetEditorData,
  selectCollectionFile
} from '../actions/editorActions';
import { logout } from '../actions/userActions';
import { toRoute } from '../actions/routeActions';

import ExternalLinkIcon from './svg/ExternalLinkIcon';
import BranchIcon from './svg/BranchIcon';
import LogoutIcon from './svg/LogoutIcon';
import RepoSelection from './Header/RepoSelection';
import notify from './common/Notify';
import JekyllProStatus from './Header/JekyllProStatus';

const RETRY_INTERVAL = 20 * 1000; // 20 seconds
let MAX_RETRY_COUNTER = 8;
let retryTimeout = null;

@connect(mapStateToProps, mapDispatchToProps)
export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedType: undefined
    };
  }

  componentDidMount() {
    this.loadBasicRepoData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { params: { repoOwner, repoName } } = this.props;
    const {
      repoOwner: prevRepoOwner,
      repoName: prevRepoName
    } = prevProps.params;
    // happens when user select different repository
    if (
      (prevRepoOwner && prevRepoName && repoOwner !== prevRepoOwner) ||
      repoName !== prevRepoName
    ) {
      this.loadBasicRepoData();
    }
  }

  loadBasicRepoData() {
    const repoOwnerCk = Cookie.get('repoOwner');
    const repoNameCk = Cookie.get('repoName');
    const {
      fetchRepoInfo,
      getAllBranch,
      toRoute,
      checkoutBranch,
      location: { query },
      params: { repoOwner, repoName }
    } = this.props;

    if (repoOwner && repoName) {
      // find repo info in url
      Cookie.set('repoOwner', repoOwner, { expires: 100 });
      Cookie.set('repoName', repoName, { expires: 100 });

      fetchRepoInfo()
        .then(res => {
          getAllBranch();
          if (query && query.branch) {
            checkoutBranch(query.branch);
          }
          this.fetchLatestIndex(query && query.branch);
        })
        .catch(err => {
          Cookie.remove('repoOwner');
          Cookie.remove('repoName');
          toRoute({ pathname: '/select', query: { reset: 1 } });
        });
    } else if (repoOwnerCk && repoNameCk) {
      // find repo info in cookie
      fetchRepoInfo()
        .then(res => {
          toRoute({
            pathname: `/${repoOwnerCk}/${repoNameCk}/`
          });
          getAllBranch();
          this.fetchLatestIndex();
        })
        .catch(err => {
          Cookie.remove('repoOwner');
          Cookie.remove('repoName');
          toRoute({ pathname: '/select', query: { reset: 1 } });
        });
    } else {
      toRoute({ pathname: '/select', query: { reset: 1 } });
    }
  }

  startUpdateInterval() {
    const {
      location: { query },
      currentBranch,
      fetchUpdatedCollections
    } = this.props;
    const branch = (query && query.branch) || currentBranch;
    fetchUpdatedCollections(branch);
  }

  fetchLatestIndex(branchInRoute) {
    const { fetchRepoIndex, currentBranch } = this.props;
    const branch = branchInRoute || currentBranch;

    fetchRepoIndex({ branch })
      .then(indexData => {
        return this.checkIfHasSchema(indexData, branchInRoute);
      })
      .then(data => {
        this.checkIfExistingFile(data);
        this.updateInterval = setInterval(
          this.startUpdateInterval.bind(this),
          8000
        );
      })
      .catch(err => {
        this.indexDataErrorHandler(err);
      });
  }

  checkIfHasSchema(indexData, branchInRoute) {
    const { toRoute, location, fetchRepoIndex, currentBranch } = this.props;
    // this repo branch might have legacy index data even it does not have schemas,
    // in this case, do a refresh index build,
    // if it still does not have schemas, the request will return error.
    if (!indexData.schemas || !indexData.schemas.length) {
      return fetchRepoIndex({
        branch: branchInRoute || currentBranch,
        refresh: true
      });
    }
    return Promise.resolve(indexData);
  }

  checkIfExistingFile(indexData) {
    const { params, toRoute, location, selectCollectionFile } = this.props;

    if (params.splat && params.splat !== 'new') {
      let fileMatched = indexData.collections.some(item => {
        if (item.path === params.splat) {
          selectCollectionFile(item);
          // break iteration
          return true;
        }
        return false;
      });

      if (!fileMatched) {
        toRoute({
          pathname: location.pathname,
          query: { fileNotFound: 1 }
        });
      }
    }
  }

  indexDataErrorHandler(err, options) {
    const {
      retryIndexFetchRequest,
      toRoute,
      location: { pathname, query }
    } = this.props;
    if (err.status === 404) {
      const customError = JSON.parse(err.response.text);
      // remove waitingIndexUpdate message box if any
      retryIndexFetchRequest(false);

      if (customError.errorCode === 4042) {
        return toRoute({
          pathname,
          query: Object.assign({ noSchema: 1 }, query)
        });
      }
      toRoute({
        pathname,
        query: Object.assign({ invalidRepo: 1 }, query)
      });
    } else if (err.status === 409) {
      // Calling the function only at first time,
      // Not to display waitingIndexUpdate message box when it is an index refresh request,
      if (!options || (!options.isRetry && !options.isRefresh)) {
        retryIndexFetchRequest('WAITING');
      }

      retryTimeout = setTimeout(() => {
        this.fetchLatestIndexCountDown(options && options.isRefresh);
      }, RETRY_INTERVAL);
    }
  }

  fetchLatestIndexCountDown(isRefresh) {
    const {
      retryIndexFetchRequest,
      currentBranch,
      fetchRepoIndex
    } = this.props;

    if (MAX_RETRY_COUNTER < 1) {
      // display waitingIndexUpdate failed message box
      retryIndexFetchRequest('FAILED');
      retryTimeout = null;
    } else if (retryTimeout) {
      MAX_RETRY_COUNTER = MAX_RETRY_COUNTER - 1;

      fetchRepoIndex({ branch: currentBranch }, true)
        .then(data => {
          // remove waitingIndexUpdate message box
          retryIndexFetchRequest(false);
          retryTimeout = null;
          this.checkIfExistingFile(data);
        })
        .catch(err => {
          this.indexDataErrorHandler(err, { isRefresh, isRetry: true });
        });
    }
  }

  handleBranchChange(newBranch) {
    const { checkoutBranch, toRoute } = this.props;
    const { repoOwner, repoName } = this.props.params;
    this.updateInterval && clearInterval(this.updateInterval);

    checkoutBranch(newBranch).then(() => {
      this.fetchLatestIndex();
    });
    toRoute(`/${repoOwner}/${repoName}/?branch=${newBranch}`);
  }

  logout() {
    const { logout } = this.props;
    const appUrl = window.location.origin;
    logout().then(res => {
      window.location = appUrl;
    });
  }

  render() {
    const {
      branches,
      currentBranch,
      avatar,
      userName,
      userUrl,
      repoDetails,
      repoUpdateSignal,
      resetUpdateSignal,
      params: { repoOwner, repoName }
    } = this.props;

    return (
      <header id="header">
        <span className="menu user">
          <a className="item">
            <img src={avatar} />
          </a>
          <div className="options">
            <a href={userUrl} target="_blank">
              <ExternalLinkIcon />
              {userName}
            </a>
            <hr />
            <a onClick={() => this.logout()}>
              <LogoutIcon />
              Logout
            </a>
          </div>
        </span>
        <span className="repo menu">
          <a className="item">
            {repoDetails && <img src={repoDetails.ownerAvatar} />}
            {repoName}
          </a>
          <RepoSelection {...this.props}>
            <a
              href={`https://github.com/${repoOwner}/${repoName}`}
              target="_blank"
            >
              <ExternalLinkIcon />
              {repoOwner}/{repoName}
            </a>
            <hr />
          </RepoSelection>
        </span>
        <span className="branch menu">
          <a className="item">
            <BranchIcon />
            {currentBranch}
          </a>
          {branches &&
            <div className="options">
              {branches &&
                branches.map(b => {
                  return (
                    <a
                      className={b.name === currentBranch ? 'selected' : ''}
                      onClick={this.handleBranchChange.bind(this, b.name)}
                      key={b.name}
                    >
                      <BranchIcon />
                      <span>
                        {b.name}
                      </span>
                    </a>
                  );
                })}
            </div>}
        </span>
        <JekyllProStatus
          {...{
            repoOwner,
            repoName,
            currentBranch,
            repoUpdateSignal,
            resetUpdateSignal
          }}
        />
      </header>
    );
  }
}

function mapStateToProps(
  state,
  { params: { collectionType, branch, splat: path } }
) {
  var repoStatus = state.repo.toJSON();
  return {
    currentBranch: repoStatus.currentBranch,
    avatar: state.user.get('avatar'),
    schemas: repoStatus.schemas,
    userName: state.user.get('userName'),
    userUrl: state.user.get('userUrl'),
    branches: repoStatus.branches,
    repoDetails: repoStatus.repoDetails,
    repoUpdateSignal: repoStatus.repoUpdateSignal,
    currentBranchUpdatedAt: repoStatus.currentBranchUpdatedAt,
    indexUpdatedAt: repoStatus.indexUpdatedAt,
    indexFetchStatus: repoStatus.indexFetchStatus
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getAllBranch,
      checkoutBranch,
      logout,
      resetRepoData,
      resetEditorData,
      toRoute,
      selectCollectionFile,
      fetchRepoInfo,
      fetchRepoIndex,
      fetchUpdatedCollections,
      resetUpdateSignal,
      retryIndexFetchRequest
    },
    dispatch
  );
}
