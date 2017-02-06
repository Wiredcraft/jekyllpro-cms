import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import ModalCustomStyle from '../Modal'
import ModalCloseIcon from '../svg/ModalCloseIcon'
import { injectDefaultSchema } from '../../helpers/api'
import { toRoute } from '../../actions/routeActions'
import { triggerIndexRefresh } from '../../actions/repoActions'

@connect(mapStateToProps, mapDispatchToProps)
export default class NoSchema extends Component {
  constructor (props) {
    super(props)
    this.state = {
      processing: false,
      modalOpen: false
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ modalOpen: true })
    }, 3000)
  }

  handleCreateBtn () {
    const { toRoute, currentBranch, repoFullName, triggerIndexRefresh } = this.props
    this.setState({ processing: true })

    injectDefaultSchema(currentBranch).then(res => {
      triggerIndexRefresh()
      toRoute({
        pathname: '/' + repoFullName
      })
    })
  }

  closeModal () {
    this.setState({ modalOpen: false })
  }
    
  render () {
    const { processing, modalOpen } = this.state
    const { currentBranch, repoFullName } = this.props

    return (
      <section id='content' className='empty'>
        <h2>Something went wrong...</h2>
        <p>JekyllPro CMS need schema files defining the content types.</p>
        <a className='button primary' href='https://github.com/Wiredcraft/jekyllplus/wiki' target='_blank'>Read more about it...</a>
        <Modal
          contentLabel='Confirm create'
          className='confirm-schema-create'
          style={ModalCustomStyle}
          isOpen={modalOpen} >
          <header className='header'>
            <a className='close' id='close-modal' onClick={::this.closeModal}>
              <ModalCloseIcon />
            </a>
            <h2>Create default schemas</h2>
          </header>
          <section className='body'>
            <p>Would you like to add default schemas for Pages and Posts to &nbsp;
              <strong>{repoFullName}</strong> branch <strong>{currentBranch}</strong>?</p>
            <p>
              <button
                className={processing ? 'button disabled processing' : 'button primary'}
                onClick={::this.handleCreateBtn}>
                Create
              </button>
              <button className='button' onClick={::this.closeModal}>Cancel</button>
            </p>
          </section>
        </Modal>
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
