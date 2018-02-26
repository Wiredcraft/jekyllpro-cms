import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { parseFilenameFromYaml } from '../../helpers/markdown';
import { parseFilePathByLang, getFilenameFromPath } from '../../helpers/utils';

import { selectCollectionFile, resetEditorData } from '../../actions/editorActions';
import { toRoute, replaceRoute } from '../../actions/routeActions';

import FileListing from './FileListing';
import ContentHeader from './ContentHeader';

class MainCL extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredCollections: [],
      filtering: false,
      filteredName: '',
      filteredType: null,
      filteredLanguage: null
    };
  }

  createNewFileByType(type) {
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
    const { collections } = this.props;
    const { filteredType, filtering } = this.state;
    const val = evt.target.value.toLowerCase();

    this.setState({ filteredName: val }, () => {
      this.filterContentList();
    });
  }

  selectTypeFilter(type) {
    const { toRoute, pathname, query } = this.props;

    this.setState({ filteredType: type }, () => {
      this.filterContentList();
    });

    toRoute({
      pathname,
      query: Object.assign({}, query, { filteredType: type })
    });
  }

  removeTypeFilter() {
    const { toRoute, pathname, query } = this.props;
    delete query.filteredType;

    this.setState({ filteredType: null }, () => {
      this.filterContentList();
    });

    toRoute({
      pathname,
      query
    });
  }

  selectLanguageFilter(lang) {
    const { toRoute, pathname, query } = this.props;
    console.log(lang, pathname);
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
    const { collections, config } = this.props;
    const { filteredType, filteredLanguage, filteredName } = this.state;
    let fc = collections.filter(item => {
      let isMatch = true;
      if (filteredType) {
        isMatch = isMatch && item.collectionType === filteredType;
      }
      if (filteredLanguage) {
        isMatch =
          isMatch &&
          parseFilePathByLang(item.path, config.languages) === filteredLanguage;
      }
      if (filteredName) {
        let fTitle = parseFilenameFromYaml(item.content) || '';
        fTitle = fTitle.toLowerCase();
        let fName = item.path.toLowerCase();
        let filterText = filteredName.toLowerCase();
        isMatch =
          isMatch &&
          (fName.indexOf(filterText) > -1 || fTitle.indexOf(filterText) > -1);
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
    const {
      filteredCollections,
      filtering,
      filteredType,
      filteredLanguage
    } = this.state;
    let records = filtering ? filteredCollections : collections;

    return (
      <section id="content">
        {collections &&
          <ContentHeader
            config={config}
            schemas={schemas}
            createNewFileByType={::this.createNewFileByType}
            filteredLanguage={filteredLanguage}
            filteredType={filteredType}
            selectLanguageFilter={::this.selectLanguageFilter}
            selectTypeFilter={::this.selectTypeFilter}
            handleNameFilter={::this.handleNameFilter}
            removeTypeFilter={::this.removeTypeFilter}
            removeLanguageFilter={::this.removeLanguageFilter}
          />}
        <FileListing
          noContent={collections && collections.length === 0}
          noResult={filtering && filteredCollections.length === 0}
          records={records}
          selectItem={::this.selectItem}
        />
      </section>
    );
  }
}

function mapStateToProps(state) {
  var repoState = state.repo.toJSON();
  return {
    loading: repoState.loading,
    collections: repoState.collections,
    schemas: repoState.schemas,
    config: repoState.config,
    currentBranch: repoState.currentBranch
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toRoute,
      replaceRoute,
      resetEditorData,
      selectCollectionFile
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(MainCL);
