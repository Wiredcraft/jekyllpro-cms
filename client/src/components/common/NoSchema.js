import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { injectDefaultSchema } from '../../helpers/api'
import { toRoute } from '../../actions/routeActions'
import { triggerIndexRefresh } from '../../actions/repoActions'

@connect(mapStateToProps, mapDispatchToProps)
export default class NoSchema extends Component {
  constructor (props) {
    super(props)
    this.state = {
      processing: false
    }
  }

  handleCreateBtn () {
    const { toRoute, currentBranch, repoFullName, triggerIndexRefresh } = this.props
    this.setState({ processing: true })

    injectDefaultSchema(currentBranch).then(res => {
      triggerIndexRefresh()
      toRoute({
        pathname: '/' + repoFullName,
        query: { branch: currentBranch }
      })
    })
  }
    
  render () {
    const { processing, modalOpen } = this.state
    const { currentBranch, repoFullName } = this.props

    return (
      <section id='content' className='empty'>
        <h2>Just one more thing...</h2>
        <p>You need to define the content types by adding "schema files" to your repo.</p>
        <button
          className={processing ? 'button disabled processing' : 'button primary'}
          onClick={::this.handleCreateBtn}>
          Add defaults (<i>Posts</i> & <i>Pages</i>)
        </button>
        <small><a href='https://github.com/Wiredcraft/jekyllplus/wiki' target='_blank' className='readmore'>Read more about schema files</a></small>
      </section>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentBranch: state.repo.toJSON().currentBranch
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    toRoute,
    triggerIndexRefresh
  }, dispatch)
}
