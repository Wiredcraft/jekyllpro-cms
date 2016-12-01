import React, { Component } from 'react'
import moment from 'moment'
import { Link } from 'react-router'
import { parseFilenameFromYaml } from '../../helpers/markdown'

export default class ContentSidebar extends Component {
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

  componentWillMount() {
    const { fetchRepoIndex, params, changeEditorMode, collections, toRoute, location,
      selectCollectionFile, currentBranch, query, lastRepoUpdate } = this.props

    changeEditorMode('collection')
    if (collections) {
      return
    }
    fetchRepoIndex({ branch: currentBranch })
    .then((indexData) => {
      // check if index is out of sync
      if (Date.parse(indexData.updated) < Date.parse(lastRepoUpdate)) {
        this.setState({ loadingIndex: true })
        return fetchRepoIndex({ branch: currentBranch, refresh: true })
          .then((newIndexData) => {
            this.setState({ loadingIndex: false })
            // check if this repo has schemas
            if (!newIndexData.schemas || !newIndexData.schemas.length) {
              return toRoute({
                pathname: location.pathname,
                query: { invalidRepo: 1 }
              })
            }
            return newIndexData
          })
      }
      // check if this repo has schemas
      if (!indexData.schemas || !indexData.schemas.length) {
        return toRoute({
          pathname: location.pathname,
          query: { invalidRepo: 1 }
        })
      }
      return indexData
    })
    .then((data) => {
      if (params && (params.splat !== 'new')) {
        data.collections.some(item => {
          if (item.path === params.splat) {
            selectCollectionFile(item)
            // break iteration
            return true
          }
          return false
        })
      }
      if (query && query.filteredType) {
        this.handleTypeFilter(query.filteredType)
      }
    })
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props
    const { filteredType } = this.props.query
    if (filteredType && (filteredType !== prevProps.query.filteredType)) {
      this.handleTypeFilter(filteredType)
    }
    if (params && (params.splat !== prevProps.params.splat)) {
      this.setState({ selectedItem: params.splat })
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

    return (
      <nav id='sidebar'>
        <header className='header'>
          <span className='controls'>
            <span className="menu">
              <button className="button primary create">
                Create
                <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z"></path>
                  <path d="M0 0h24v24H0z" fill="none"></path>
                </svg>
              </button>
              <div className="options">
                {
                  schemas && schemas.map((s, idx) => {
                    return <a key={`${s.title}-${idx}`} onClick={this.createNewFileByType.bind(this, s.jekyll.id)}>{s.title}</a>
                  })
                }
              </div>
            </span>
          </span>
          <span className='search'>
            <input type='text' placeholder='Filter by name' onChange={::this.handleNameFilter} />
            <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
              <path d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' />
            </svg>
          </span>
          {
            filteredType && (<ul className="filters">
              <li className="bundle">
                <button className="button">Content: {filteredType}</button>
                <button className="button icon tooltip" onClick={::this.removeFilterType}>
                  <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path>
                  </svg>
                  <span>Remove</span>
                </button>
              </li>
            </ul>)
          }
        </header>
        <section className={this.state.loadingIndex ? 'body list loading' : 'body list'}>
          {
            records && records.map((c, idx) => {
              return (
                <a className={selectedItem === c.path ? 'active': ''}
                  onClick={this.selectItem.bind(this, c)}
                  key={`${c.path}-${idx}`}>
                  <h2>{parseFilenameFromYaml(c.content)}</h2>
                  <small className='meta'>{c.collectionType} . {moment(Date.parse(c.lastUpdatedAt)).fromNow()}</small>
                </a>
              )
            })
         }
        </section>
      </nav>
    )
  }
}