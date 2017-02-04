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
    const { toRoute, currentBranch, repoFullName } = this.props
    this.setState({ processing: true })

    injectDefaultSchema(currentBranch).then(res => {
      triggerIndexRefresh()
      toRoute({
        pathname: '/' + repoFullName
      })
    })
  }
    
  render () {
    const { processing } = this.state

    return (
      <section id='content' className='empty'>
        <h2>Something went wrong...</h2>
        <p>JekyllPro CMS need schema files defining the content types.</p>
        <a className='button primary' href='https://github.com/Wiredcraft/jekyllplus/wiki' target='_blank'>Read more about it...</a>
        <hr />
        <p>Would you like to add default schemas for Pages and Posts to this repository branch?</p>
        <button
          className={processing ? 'button disabled processing' : 'button primary'}
          onClick={::this.handleCreateBtn}>
          Create
        </button>
      </section>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentBranch: state.repo.get('currentBranch')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    toRoute,
    triggerIndexRefresh
  }, dispatch)
}
