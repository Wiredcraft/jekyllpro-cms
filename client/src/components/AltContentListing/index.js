import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';
import moment from 'moment';

import { parseFilePathByLang, getFilenameFromPath } from 'helpers/utils';
import {
  parseYamlInsideMarkdown,
  parseFilenameFromYaml
} from 'helpers/markdown';

import { selectCollectionFile, resetEditorData } from 'actions/editorActions';
import { fetchRepoIndex, fetchRepoTree } from 'actions/repoActions';
import { toRoute, replaceRoute } from 'actions/routeActions';
import NoSchema from 'components/common/NoSchema';
import InvalidRepo from 'components/common/InvalidRepo';

import CaretDownIcon from 'components/svg/CaretDownIcon';
import RemoveIcon from 'components/svg/RemoveIcon';
import CheckIcon from 'components/svg/CheckIcon';

import Nav from './Nav';

class ContentListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredCollections: [],
      filtering: false,
      filteredName: '',
      filteredLanguage: null
    };
  }

  componentWillMount() {
    const { menuPath } = this.props;
    menuPath && this.filterContentList();
  }

  componentDidUpdate(prevProps) {
    const { menuPath } = this.props;
    if (menuPath !== prevProps.menuPath) {
      this.filterContentList();
    }
  }

  createNewFileWithFilter(type) {
    const {
      resetEditorData,
      toRoute,
      currentBranch,
      params: { repoOwner, repoName }
    } = this.props;
    resetEditorData();
    toRoute(`/${repoOwner}/${repoName}/${type}/${currentBranch}/new`);
  }

  handleNameFilter(evt) {
    const val = evt.target.value.toLowerCase();

    this.setState({ filteredName: val }, () => {
      this.filterContentList();
    });
  }

  selectLanguageFilter(lang) {
    const { toRoute, pathname, query } = this.props;

    this.setState({ filteredLanguage: lang }, () => {
      this.filterContentList();
    });

    toRoute({
      pathname,
      query: Object.assign({}, query, { filteredLanguage: lang })
    });
  }

  removeLanguageFilter() {
    const { toRoute, pathname, query } = this.props;
    delete query.filteredLanguage;

    this.setState({ filteredLanguage: null }, () => {
      this.filterContentList();
    });

    toRoute({
      pathname,
      query
    });
  }

  filterContentList() {
    const { collections, config, menuMeta } = this.props;
    const { filteredLanguage, filteredName } = this.state;
    let fc = collections.filter(item => {
      let isMatch = true;
      if (isMatch && menuMeta && menuMeta.collection_type) {
        isMatch = item.collectionType === menuMeta.collection_type;
      }
      if (isMatch && menuMeta && menuMeta.category) {
        let contentObj = parseYamlInsideMarkdown(item.content);
        let itemCategoryStr =
          (contentObj &&
            contentObj.category &&
            contentObj.category.toString().toLowerCase()) ||
          '';
        let targetCategoryStr = menuMeta.category.toString().toLowerCase();
        isMatch = itemCategoryStr.indexOf(targetCategoryStr) === 0;
      }
      if (isMatch && filteredLanguage) {
        isMatch =
          parseFilePathByLang(item.path, config.languages) === filteredLanguage;
      }
      if (isMatch && filteredName) {
        let fTitle = parseFilenameFromYaml(item.content) || '';
        fTitle = fTitle.toLowerCase();
        let fName = item.path.toLowerCase();
        let filterText = filteredName.toLowerCase();
        isMatch =
          fName.indexOf(filterText) > -1 || fTitle.indexOf(filterText) > -1;
      }
      return isMatch;
    });

    this.setState({ filtering: true, filteredCollections: fc });
  }

  selectItem(item) {
    const {
      selectCollectionFile,
      toRoute,
      currentBranch,
      params: { repoOwner, repoName }
    } = this.props;
    selectCollectionFile(item);
    toRoute(
      `/${repoOwner}/${repoName}/${item.collectionType}/${currentBranch}/${item.path}`
    );
  }

  render() {
    const {
      config,
      schemas,
      collections,
      pathname,
      query,
      repoFullName
    } = this.props;
    const { filteredCollections, filtering, filteredLanguage } = this.state;
    let records = filtering ? filteredCollections : collections;

    if (query && query.invalidRepo === '1') {
      return <InvalidRepo />;
    }
    if (query && query.noSchema === '1') {
      return <NoSchema repoFullName={repoFullName} />;
    }

    return (
      <section id="content" className="withNav">
        <Nav />
        <section className="listing">
          {collections &&
            <header className="header">
              <div className="controls">
                <span className="menu">
                  <button className="button primary create disabled">
                    Create
                  </button>
                </span>
              </div>

              <span className="search">
                <span className="menu">
                  <button className="button">
                    Filters
                    <CaretDownIcon />
                  </button>
                  <div className="options">
                    {config && config.languages && <h2>Filter by language</h2>}
                    {config &&
                      config.languages &&
                      config.languages.map((lang, idx) => {
                        return (
                          <a
                            key={lang.code}
                            onClick={this.selectLanguageFilter.bind(
                              this,
                              lang.code
                            )}
                            className={
                              filteredLanguage === lang.code ? 'selected' : ''
                            }
                          >
                            <CheckIcon />
                            {lang.name}
                          </a>
                        );
                      })}
                  </div>
                </span>
                <input
                  type="text"
                  placeholder="Filter by name"
                  onChange={::this.handleNameFilter}
                />
              </span>

              <ul className="filters">
                {filteredLanguage &&
                  <li>
                    <span>
                      Language: {filteredLanguage}
                    </span>
                    <a className="remove" onClick={::this.removeLanguageFilter}>
                      <RemoveIcon />
                    </a>
                  </li>}
              </ul>
            </header>}
          <section className="body list">
            {collections &&
              collections.length === 0 &&
              <section className="body empty">
                <span>You haven\'t published any content yet.</span>
              </section>}
            {filtering &&
              filteredCollections.length === 0 &&
              <section className="body empty">
                <span>No content matches your search criteria.</span>
              </section>}
            {records &&
              records
                .sort((curr, next) => {
                  return (
                    Date.parse(next.lastUpdatedAt) -
                    Date.parse(curr.lastUpdatedAt)
                  );
                })
                .map((c, idx) => {
                  return (
                    <a
                      onClick={this.selectItem.bind(this, c)}
                      key={`${c.path}-${idx}`}
                    >
                      <h2>
                        {parseFilenameFromYaml(c.content) ||
                          getFilenameFromPath(c.path)}
                      </h2>
                      <small className="meta">
                        <strong>{c.collectionType}</strong>&nbsp; Updated&nbsp;
                        {moment(Date.parse(c.lastUpdatedAt)).fromNow()}&nbsp;
                        by&nbsp;
                        {c.lastUpdatedBy}
                      </small>
                    </a>
                  );
                })}
          </section>
        </section>
      </section>
    );
  }
}

function mapStateToProps(
  state,
  {
    params: { repoOwner, repoName, collectionType, branch, splat: path },
    location: { pathname, query }
  }
) {
  var repoState = state.repo.toJSON();
  var navState = state.nav.toJSON();
  return {
    repoFullName: `${repoOwner}/${repoName}`,
    pathname: pathname,
    query: query,
    loading: repoState.loading,
    collections: repoState.collections,
    schemas: repoState.schemas,
    config: repoState.config,
    currentBranch: repoState.currentBranch,
    menuMeta: navState.menuMeta,
    menuPath: navState.menuPath
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      fetchRepoIndex,
      toRoute,
      replaceRoute,
      resetEditorData,
      selectCollectionFile,
      fetchRepoTree
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentListing);
