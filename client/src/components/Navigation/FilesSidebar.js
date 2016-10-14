import React, { Component } from 'react'
import { parseFileTree } from "../../helpers/utils"
import FileIcon from '../svg/FileIcon'
import FolderIcon from '../svg/FolderIcon'

export default class FilesSidebar extends Component {
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
    const { fetchRepoTree, params, currentBranch } = this.props
    fetchRepoTree(currentBranch)
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
    const { treeMeta } = this.props
    const parsedTreeMeta = treeMeta && parseFileTree(treeMeta)

    return (
      <nav id='sidebar'>
        <header className='header'>
          <span className='controls'>
            <button className='button primary icon tooltip-bottom'>
              <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
                <path d='M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z' />
              </svg>
              <span>Upload</span>
            </button>

            <button className='button primary create'>Create</button>
          </span>
          <span className='search'>
            <input type='text' placeholder='Filter by name'/>
            <svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
              <path d='M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' />
            </svg>
          </span>
        </header>
        <span className='body tree'>
          <ul>
          {
            parsedTreeMeta && parsedTreeMeta._contents.map(file => {
              return (
                <li key={file.path}>
                  <a><FileIcon /><span>{file.name}</span></a>
                </li>
              )
            })
          }
          {
            parsedTreeMeta && Object.keys(parsedTreeMeta)
            .filter(k => { return k !== '_contents' })
            .map(prop => {
              return (
                <li key={prop}>
                  <a><FolderIcon /><span>{prop}</span></a>
                  <ul>
                    {
                      parsedTreeMeta[prop]._contents.map(c => {
                        return (
                          <li key={c.path}>
                            <a><FileIcon /><span>{c.name}</span></a>
                          </li>
                        )
                      })
                    }
                  </ul>
                </li>
              )
            })
          }
          </ul>
        </span>
      </nav>
    )
  }
}