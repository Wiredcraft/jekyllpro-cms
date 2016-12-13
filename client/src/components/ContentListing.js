import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'
import { Link } from 'react-router'
import moment from 'moment'

import { parseFilenameFromYaml } from '../helpers/markdown'

import { changeEditorMode, selectCollectionFile } from '../actions/editorActions'
import { fetchRepoIndex, fetchRepoTree } from '../actions/repoActions'
import { toRoute, replaceRoute } from '../actions/routeActions'
import NoSchema from './common/NoSchema'

import CaretDownIcon from './svg/CaretDownIcon'
import RemoveIcon from './svg/RemoveIcon'
import CheckIcon from './svg/CheckIcon'

class ContentListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedItem: props.params ? props.params.splat : undefined,
      filteredCollections: [],
      filtering: false,
      filteredType: null,
      loadingIndex: false
    }
  }

  componentDidUpdate(prevProps) {
    const { params, schemas, toRoute, location } = this.props
    const { filteredType } = this.props.query
    if (filteredType && (filteredType !== prevProps.query.filteredType)) {
      this.handleTypeFilter(filteredType)
    }
    if (params && (params.splat !== prevProps.params.splat)) {
      this.setState({ selectedItem: params.splat })
    }
    // switched branch and branch has no schemas
    if ((!schemas || !schemas.length) && (schemas !== prevProps.schemas)) {
      toRoute({
        pathname: location.pathname,
        query: { invalidRepo: 1 }
      })
    }
  }

  handleNameFilter(evt) {
    const { collections } = this.props
    const { filteredType, filtering } = this.state
    const val = evt.target.value.toLowerCase()
    if (val === '') {
      if (filtering) {
        return this.setState({filtering: false})
      }
      return
    }
    let f = collections.filter(item => {
      let isRightType = filteredType ? item.collectionType === filteredType : true

      return isRightType && (item.path.toLowerCase().indexOf(val) > -1)
    })
    this.setState({ filteredCollections: f, filtering: true })
  }

  createNewFileByType(type) {
    const { changeEditorMode, toRoute, currentBranch, params: { repoOwner, repoName } } = this.props
    changeEditorMode('collection')
    toRoute(`/${repoOwner}/${repoName}/${type}/${currentBranch}/new`)
  }

  handleTypeFilter(type) {
    let f = this.props.collections.filter(item => {
      return item.collectionType === type
    })
    this.setState({filtering: true, filteredType: type, filteredCollections: f})
  }

  removeFilterType() {
    const { toRoute, pathname } = this.props
    this.setState({filtering: false, filteredType: null})
    toRoute(`${pathname}`)
  }

  selectItem(item) {
    const { selectCollectionFile, changeEditorMode,
      toRoute, currentBranch, params: { repoOwner, repoName } } = this.props
    this.setState({selectedItem: item.path})
    selectCollectionFile(item)
    changeEditorMode('collection')
    toRoute(`/${repoOwner}/${repoName}/${item.collectionType}/${currentBranch}/${item.path}`)
  }

  render() {
    const { schemas, collections, pathname, query } = this.props
    const { filteredCollections, filtering, selectedItem, filteredType } = this.state
    let records = filtering ? filteredCollections : collections

    if (query && query.invalidRepo === '1') {
      return (<NoSchema />)
    }

    return (
      <section id='content' className={this.state.loadingIndex ? 'loading' : ''}>
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
                <h2>Filter by type</h2>
                {
                  schemas && schemas.map((s, idx) => {
                    return (<Link key={s.title}
                      to={`${pathname}?filteredType=${s.jekyll.id}`}
                      className={filteredType === s.jekyll.id ? 'selected' : ''} >
                      <CheckIcon />
                      {s.title}
                    </Link>)
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
              filteredType && <li>
                <span>Type: {filteredType}</span>
                <a className="remove" onClick={::this.removeFilterType}>
                  <RemoveIcon />
                </a>
              </li>
            }
            <li>
              <span>Language: English</span>
              <a className="remove">
                <RemoveIcon />
              </a>
            </li>
          </ul>
        </header>
        <section className='body list'>
          {
            records && records.sort((curr, next) => {
              return Date.parse(next.lastUpdatedAt) - Date.parse(curr.lastUpdatedAt)
            })
            .map((c, idx) => {
              return (
                <a className={selectedItem === c.path ? 'active': ''}
                  onClick={this.selectItem.bind(this, c)}
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
  params: { collectionType, branch, splat: path },
  location: { pathname, query } }) {
  return {
    pathname: pathname,
    query: query,
    loading: state.repo.get('loading'),
    collections: state.repo.get('collections'),
    schemas: state.repo.get('schemas'),
    treeMeta: state.repo.get('treeMeta'),
    currentBranch: state.repo.get('currentBranch')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ fetchRepoIndex, toRoute, replaceRoute, changeEditorMode,
    selectCollectionFile, fetchRepoTree }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentListing)
