import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { Component } from 'react';
import moment from 'moment';

import { parseFilePathByLang, getFilenameFromPath } from '../../helpers/utils';
import {
  parseYamlInsideMarkdown,
  parseFilenameFromYaml
} from '../../helpers/markdown';
import { filterFn } from '../../helpers/filters';

import { selectCollectionFile, openNewFileEditor } from '../../actions/editorActions';
import { toRoute, replaceRoute } from '../../actions/routeActions';

import FileListing from './FileListing';
import AltContentHeader from './AltContentHeader';
import Nav from './Nav';

class AltCL extends Component {
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

  createNewFileWithFilter() {
    const {
      menuMeta,
      openNewFileEditor,
      toRoute,
      currentBranch,
      params: { repoOwner, repoName }
    } = this.props;
    if (menuMeta && menuMeta.collection_type) {
      openNewFileEditor(menuMeta.default);
      toRoute(
        `/${repoOwner}/${repoName}/${menuMeta.collection_type}/${currentBranch}/new`
      );
    }
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
        if (typeof menuMeta.collection_type === 'string') {
          isMatch = item.collectionType === menuMeta.collection_type;
        } else {
          isMatch = menuMeta.collection_type.indexOf(item.collectionType) > -1;
        }
      }
      if (isMatch && menuMeta && menuMeta.filter) {
        let contentObj = parseYamlInsideMarkdown(item.content);
        isMatch = contentObj && filterFn(menuMeta.filter, contentObj);
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
    const { menuMeta, config, schemas, collections } = this.props;
    const { filteredCollections, filtering, filteredLanguage } = this.state;
    let records = filtering ? filteredCollections : collections;

    return (
      <section id="content" className="withNav">
        <Nav menu={config.nav_menu} />
        <section className="listing">
          {collections &&
            <AltContentHeader
              creatable={menuMeta && menuMeta.creatable}
              config={config}
              schemas={schemas}
              createNewFileWithFilter={::this.createNewFileWithFilter}
              filteredLanguage={filteredLanguage}
              selectLanguageFilter={::this.selectLanguageFilter}
              handleNameFilter={::this.handleNameFilter}
              removeLanguageFilter={::this.removeLanguageFilter}
            />}
          <FileListing
            noContent={collections && collections.length === 0}
            noResult={filtering && filteredCollections.length === 0}
            records={records}
            selectItem={::this.selectItem}
          />
        </section>
      </section>
    );
  }
}

function mapStateToProps(state) {
  var repoState = state.repo.toJSON();
  var navState = state.nav.toJSON();
  return {
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
      toRoute,
      replaceRoute,
      openNewFileEditor,
      selectCollectionFile
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(AltCL);
