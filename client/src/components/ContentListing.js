import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import moment from 'moment'

import { parseFilenameFromYaml } from '../helpers/markdown'
import { parseFilePathByLang } from "../helpers/utils"

import { selectCollectionFile, resetEditorData } from '../actions/editorActions'
import { fetchRepoIndex, fetchRepoTree } from '../actions/repoActions'
import { toRoute, replaceRoute } from '../actions/routeActions'
import NoSchema from './common/NoSchema'
import InvalidRepo from './common/InvalidRepo'

import CaretDownIcon from './svg/CaretDownIcon'
import RemoveIcon from './svg/RemoveIcon'
import CheckIcon from './svg/CheckIcon'

class ContentListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filteredCollections: [],
      filtering: false,
      filteredName: '',
      filteredType: null,
      filteredLanguage: null
    }
  }

  createNewFileByType(type) {
    const { resetEditorData, toRoute, currentBranch, params: { repoOwner, repoName } } = this.props
    resetEditorData()
    toRoute(`/${repoOwner}/${repoName}/${type}/${currentBranch}/new`)
  }

  handleNameFilter(evt) {
    const { collections } = this.props
    const { filteredType, filtering } = this.state
    const val = evt.target.value.toLowerCase()

    this.setState({ filteredName: val }, () => {
      this.filterContentList()
    })
  }

  selectTypeFilter(type) {
    const { toRoute, pathname, query } = this.props

    this.setState({filteredType: type}, () => {
      this.filterContentList()
    })

    toRoute({
      pathname,
      query: Object.assign({}, query, {filteredType: type})
    })
  }

  removeTypeFilter() {
    const { toRoute, pathname, query } = this.props
    delete query.filteredType

    this.setState({filteredType: null}, () => {
      this.filterContentList()
    })

    toRoute({
      pathname,
      query
    })    
  }

  selectLanguageFilter(lang) {
    const { toRoute, pathname, query } = this.props

    this.setState({filteredLanguage: lang}, () => {
      this.filterContentList()
    })

    toRoute({
      pathname,
      query: Object.assign({}, query, {filteredLanguage: lang})
    })
  }

  removeLanguageFilter() {
    const { toRoute, pathname, query } = this.props
    delete query.filteredLanguage

    this.setState({filteredLanguage: null}, () => {
      this.filterContentList()
    })

    toRoute({
      pathname,
      query
    })
  }

  filterContentList () {
    const { collections, config } = this.props
    const { filteredType, filteredLanguage, filteredName } = this.state
    let fc = collections.filter(item => {
      let isMatch = true
      if (filteredType) {
        isMatch = isMatch && (item.collectionType === filteredType)
      }
      if (filteredLanguage) {
        isMatch = isMatch && (parseFilePathByLang(item.path, config.languages) === filteredLanguage)
      }
      if (filteredName) {
        isMatch = isMatch && (item.path.toLowerCase().indexOf(filteredName) > -1)
      }
      return isMatch
    })

    this.setState({ filtering: true, filteredCollections: fc })
  }

  selectItem(item) {
    const { selectCollectionFile, toRoute, currentBranch, params: { repoOwner, repoName } } = this.props
    selectCollectionFile(item)
    toRoute(`/${repoOwner}/${repoName}/${item.collectionType}/${currentBranch}/${item.path}`)
  }

  render() {
    const { config, schemas, collections, pathname, query, repoFullName } = this.props
    const { filteredCollections, filtering, filteredType, filteredLanguage } = this.state
    let records = filtering ? filteredCollections : collections

    if (query && query.invalidRepo === '1') {
      return (<InvalidRepo />)
    }
    if (query && query.noSchema === '1') {
      return (<NoSchema repoFullName={repoFullName} />)
    }

    return (
      <section id='content'>
        { collections && (
          <header className="header">
            <div className="controls">
              <span className="menu">
                <button className="button primary create">
                  Create
                  <CaretDownIcon />
                </button>
                <div className="options">
                  {
                    schemas && schemas.map((s, idx) => {
                      return <a key={`${s.title}-${idx}`} onClick={this.createNewFileByType.bind(this, s.jekyll.id)}>{s.title}</a>
                    })
                  }
                </div>
              </span>
            </div>

            <span className="search">
              <span className="menu">
                <button className="button">
                  Filters
                  <CaretDownIcon />
                </button>
                <div className="options">
                  <h2>Filter by language</h2>
                  {
                    config && config.languages && config.languages.map((lang, idx) => {
                      return (<a key={lang.code}
                        onClick={this.selectLanguageFilter.bind(this, lang.code)}
                        className={filteredLanguage === lang.code ? 'selected' : ''} >
                        <CheckIcon />
                        {lang.name}
                      </a>)
                    })
                  }
                  <h2>Filter by type</h2>
                  {
                    schemas && schemas.map((s, idx) => {
                      return (<a key={s.title}
                        onClick={this.selectTypeFilter.bind(this, s.jekyll.id)}
                        className={filteredType === s.jekyll.id ? 'selected' : ''} >
                        <CheckIcon />
                        {s.title}
                      </a>)
                    })
                  }
                </div>
              </span>
              <input type="text"
                placeholder="Filter by name"
                onChange={::this.handleNameFilter} />
            </span>

            <ul className="filters">
              {
                filteredType &&
                <li>
                  <span>Type: {filteredType}</span>
                  <a className="remove" onClick={::this.removeTypeFilter}>
                    <RemoveIcon />
                  </a>
                </li>
              }
              {
                filteredLanguage &&
                <li>
                  <span>Language: {filteredLanguage}</span>
                  <a className="remove" onClick={::this.removeLanguageFilter}>
                    <RemoveIcon />
                  </a>
                </li>
              }
            </ul>
          </header>
        )}
        <section className='body list'>
          {
            collections && collections.length === 0 &&
            <section className='body empty'>
              <span>You haven\'t published any content yet.</span>
            </section>
          }        
          {
            filtering && filteredCollections.length === 0 &&
            <section className='body empty'>
              <span>No content matches your search criteria.</span>
            </section>
          }
          {
            records && records.sort((curr, next) => {
              return Date.parse(next.lastUpdatedAt) - Date.parse(curr.lastUpdatedAt)
            })
            .map((c, idx) => {
              return (
                <a onClick={this.selectItem.bind(this, c)}
                  key={`${c.path}-${idx}`}>
                  <h2>{parseFilenameFromYaml(c.content)}</h2>
                  <small className='meta'>
                    <strong>{c.collectionType}</strong>&nbsp;
                    Updated&nbsp;
                    {moment(Date.parse(c.lastUpdatedAt)).fromNow()}&nbsp;
                    by&nbsp;
                    {c.lastUpdatedBy}
                  </small>
                </a>
              )
            })
         }
        </section>
      </section>
    )
  }
}

function mapStateToProps(state, {
  params: { repoOwner, repoName, collectionType, branch, splat: path },
  location: { pathname, query } }) {
  var repoState = state.repo.toJSON();
  return {
    repoFullName: `${repoOwner}/${repoName}`,
    pathname: pathname,
    query: query,
    loading: repoState.loading,
    collections: repoState.collections,
    schemas: repoState.schemas,
    config: repoState.config,
    currentBranch: repoState.currentBranch
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ fetchRepoIndex, toRoute, replaceRoute, resetEditorData,
    selectCollectionFile, fetchRepoTree }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentListing)
