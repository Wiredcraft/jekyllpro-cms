import React, { Component } from 'react'

export default class ContentSidebar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedItem: props.params ? props.params.splat : undefined,
      filteredCollections: [],
      filtering: false,
      filteredType: null
    }
  }

  componentDidMount() {
    const { fetchRepoIndex, params, changeEditorMode, selectCollectionFile, currentBranch } = this.props
    fetchRepoIndex({ branch: currentBranch, refresh: true })
    .then((indexData) => {
      if (params && (params.splat !== 'new')) {
        indexData.collections.some(item => {
          if (item.path === params.splat) {
            selectCollectionFile(item)
            changeEditorMode('collection')
            // break iteration
            return true
          }
          return false
        })
      }
    })
  }

  handleNameFilter(evt) {
    const {filteredType, collections} = this.props
    const {filtering} = this.state
    const val = evt.target.value
    if (val === '') {
      if (filtering) {
        return this.setState({filtering: false})
      }
      return
    }
    let f = collections.filter(item => {
      let isRightType = filteredType ? item.collectionType === filteredType : true

      return isRightType && (item.path.indexOf(val) > -1)
    })
    this.setState({ filteredCollections: f, filtering: true })
  }

  createNewFileByType(type) {
    const { toRoute, currentBranch } = this.props
    toRoute(`/${type}/${currentBranch}/new`)
  }

  handleTypeFilter(type) {
    let f = this.props.collections.filter(item => {
      return item.collectionType === type
    })
    this.setState({filtering: true, filteredType: type, filteredCollections: f})
  }

  removeFilterType() {
    this.setState({filtering: false, filteredType: null})
  }

  selectItem(item) {
    const { selectCollectionFile, changeEditorMode, toRoute, currentBranch } = this.props
    this.setState({selectedItem: item.path})
    selectCollectionFile(item)
    changeEditorMode('collection')
    toRoute(`/${item.collectionType}/${currentBranch}/${item.path}`)
  }

  render() {
    const { schemas, collections } = this.props
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
                  <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"></path>
                </svg>
              </button>
              <div className="options">
                {
                  schemas && schemas.map((s, idx) => {
                    return <a key={s.title} onClick={this.createNewFileByType.bind(this, s.jekyll.id)}>{s.title}</a>
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
            <span className="menu">
              <button className="button icon">
                <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"></path>
                </svg>
              </button>
              <div className="options">
                {
                  schemas && schemas.map((s, idx) => {
                    return <a key={s.title} onClick={this.handleTypeFilter.bind(this, s.jekyll.id)}>Content: {s.title}</a>
                  })
                }
              </div>
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
          </span>
        </header>
        <section className='body list'>
          {
            records && records.map(c => {
              return (
                <a className={selectedItem === c.path ? 'active': ''}
                  onClick={this.selectItem.bind(this, c)}
                  key={c.path}>
                  <h2>{c.path}</h2>
                  <small className='meta'>{c.collectionType} . {c.lastUpdatedAt}</small>
                </a>
              )
            })
         }
        </section>
      </nav>
    )
  }
}