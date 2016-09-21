import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import { fetchFilesMeta, fetchPageFilesMeta, fetchNestedFilesMeta, fetchBranchSchema } from '../actions/repoActions'
import { parseFolderFromSchema, getDefaultFolderStructure } from '../helpers/repo'
import CollectionIcon from './svg/CollectionIcon'
import PageIcon from './svg/PageIcon'
import LayoutIcon from './svg/LayoutIcon'
import IncludeIcon from './svg/IncludeIcon'
import DataIcon from './svg/DataIcon'
import MediaIcon from './svg/MediaIcon'
import SchemaIcon from './svg/SchemaIcon'

@connect(mapStateToProps, mapDispatchToProps)
export default class Menu extends Component {
  constructor() {
    super()
    this.state = { selectedItem: '' }
  }

  componentWillMount () {
    const { currentBranch, fetchBranchSchema } = this.props
    fetchBranchSchema(currentBranch)
  }

  handleMenuItem(id, dir) {
    const {currentBranch, fetchFilesMeta, fetchPageFilesMeta, fetchNestedFilesMeta} = this.props
    this.setState({ selectedItem: id})
    switch (id) {
      case 'pages':
        fetchPageFilesMeta(currentBranch)
        break
      case 'layouts':
      case 'includes':
      case 'data':
      case 'media':
        fetchNestedFilesMeta(currentBranch, dir)
        break
      default:
        fetchFilesMeta(currentBranch, dir)
    }
  }

  render () {
    const { currentBranch, schema } = this.props
    const { selectedItem } = this.state
    const defaultMenuList = getDefaultFolderStructure()
    const contentMenuList = parseFolderFromSchema(schema, 'content')

    return (
      <nav id="menu">
        <section className="body">
          <h3>Content</h3>
          {
            schema && contentMenuList.map(item => {
              return(
                <a key={item.id}
                  className={ selectedItem === item.id ? 'active' : ''}
                  onClick={this.handleMenuItem.bind(this, item.id, item.dir)}>
                  <CollectionIcon />
                  {item.title}
                </a>
              )
            })
          }
          <h3>Others</h3>
          {
            defaultMenuList['others'].map(item => {
              return(
                <a key={item.id}
                  className={ selectedItem === item.id ? 'active' : ''}
                  onClick={this.handleMenuItem.bind(this, item.id, item.dir)}>
                  {(() => {
                    switch (item.id) {
                      case 'layouts':
                        return <LayoutIcon />
                      case 'includes':
                        return <IncludeIcon />
                      case 'data':
                        return <DataIcon />
                      case 'media':
                        return <MediaIcon />
                      default:
                        return <LayoutIcon />
                    }
                  })()}
                  {item.title}
                </a>
              )
            })
          }
          <h3>Configure</h3>
          {
            defaultMenuList['configure'].map(item => {
              return(
                <a key={item.id}
                  className={ selectedItem === item.id ? 'active' : ''}
                  onClick={this.handleMenuItem.bind(this, item.id, item.dir)}>
                  <SchemaIcon />
                  {item.title}
                </a>
              )
            })
          }
        </section>
      </nav>
    )
  }
}

function mapStateToProps(state, { params:
  { collectionType, branch, splat: path } }) {

  return {
    currentBranch: branch || 'master',
    schema: state.repo.get('schema')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ fetchFilesMeta, fetchPageFilesMeta, fetchNestedFilesMeta, fetchBranchSchema }, dispatch)
}
