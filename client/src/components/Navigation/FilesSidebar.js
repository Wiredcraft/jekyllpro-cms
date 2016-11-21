import React, { Component } from 'react'
import { parseFileTree, parseFileArray } from '../../helpers/utils'
import NestedFileTreeView from './NestedFileTreeView'

let filteringTimeout = null

export default class FilesSidebar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedItem: props.params ? props.params.splat : undefined,
      filteredTreeMeta: [],
      filtering: false
    }
  }

  componentDidMount() {
    const { fetchRepoTree, params, currentBranch, changeEditorMode } = this.props
    fetchRepoTree(currentBranch)
    changeEditorMode('files')
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props
    const fileChanged = params.splat !== prevProps.params.splat 

    if (fileChanged) {
      this.setState({ selectedItem: params.splat })
    }
  }

  handleNameFilter(evt) {
    const val = evt.target.value
    if (filteringTimeout) {
      clearTimeout(filteringTimeout)
    }
    filteringTimeout = setTimeout(this.filterTreeMetaByName.bind(this, val), 400)
  }

  filterTreeMetaByName(name) {
    const { treeMeta } = this.props
    const { filteredType, filtering } = this.state
    if (name === '') {
      if (filtering) {
        return this.setState({filtering: false})
      }
      return
    }
    name = name.toLowerCase()
    let f = treeMeta.filter(item => {
      return item.path.toLowerCase().indexOf(name) > -1
    })
    this.setState({ filteredTreeMeta: f, filtering: true })
  }

  createNewFile() {
    const { toRoute, currentBranch, params: { repoOwner, repoName } } = this.props
    toRoute(`/${repoOwner}/${repoName}/files/${currentBranch}/new`)
  }

  selectItem() {
    const { toRoute, currentBranch, params: { repoOwner, repoName } } = this.props
    return function (item) {
      toRoute(`/${repoOwner}/${repoName}/files/${currentBranch}/${item}`)
    }
  }

  toFileUpload () {
    const { toRoute, currentBranch, params: { repoOwner, repoName } } = this.props
    toRoute(`/${repoOwner}/${repoName}/files/${currentBranch}/?upload=true`)
  }

  render() {
    const { treeMeta } = this.props
    const { selectedItem, filteredTreeMeta, filtering } = this.state
    const parsedTreeMeta = treeMeta && parseFileTree(treeMeta)

    let records = filtering ? parseFileArray(filteredTreeMeta) : parsedTreeMeta

    return (
      <nav id='sidebar'>
        <header className='header'>
          <span className='controls'>
            <button className='button primary icon tooltip-bottom'
             onClick={::this.createNewFile}>
              <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                <path d="M0 0h24v24H0z" fill="none"></path>
              </svg>
              <span>Create</span>
            </button>
            <button className='button primary' onClick={::this.toFileUpload}>
              Upload
            </button>
          </span>
          <span className='search'>
            <input type='text' placeholder='Filter by name' onChange={::this.handleNameFilter}/>
            <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
              <path d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' />
            </svg>
          </span>
        </header>
        <section className='body tree'>
          <NestedFileTreeView
            selected={selectedItem}
            onclick={::this.selectItem}
            directory={records} />
        </section>
      </nav>
    )
  }
}