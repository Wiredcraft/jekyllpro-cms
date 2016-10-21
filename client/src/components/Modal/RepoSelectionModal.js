import React, { Component } from 'react'
import Cookie from 'js-cookie'
import moment from 'moment'
import Modal from 'react-modal'
import ModalCustomStyle from './index'

export default class RepoSelectionModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      inputClassname: '',
      selectedRepo: {owner: Cookie.get('repoOwner') || 'n', name: Cookie.get('repoName') || 'a'}
    }
  }

  handleKeyPress (evt) {
    if (evt.key === 'Enter') {
      const { getAllBranch, resetRepoData, resetEditorData, toRoute, fetchRepoInfo, onclose } = this.props
      let fullName = this.refs.repoInput.value.split('/')
      let repoOwner = fullName[0]
      let repoName = fullName[1]
      if (!repoName) return
      Cookie.set('repoOwner', repoOwner, { expires: 100 })
      Cookie.set('repoName', repoName, { expires: 100 })
      this.setState({ loading: true })
      resetEditorData()
      resetRepoData()
      fetchRepoInfo().then(() => {
        this.setState({
          loading: false,
          selectedRepo: { owner: repoOwner, name: repoName }
        })
        onclose()
        getAllBranch()
        toRoute(`/${repoOwner}/${repoName}/`)
      })
      .catch(err => {
        Cookie.remove('repoOwner')
        Cookie.remove('repoName')
        this.setState({ loading: false, inputClassname: 'error' })
      })
    }
  }

  render () {
    const { selectedRepo, loading, inputClassname } = this.state
    const { afterOpen, onclose, isOpen, repoDetails } = this.props
    return (
      <Modal
        style={ModalCustomStyle}
        onAfterOpen={afterOpen}
        onRequestClose={onclose}
        isOpen={isOpen}>
        <header className="header">
          <a className="close" onClick={onclose}>Close</a>
          <h2>Select an repository</h2>
        </header>
        <section className="body">
          <header className="selected">
            <h3>
              {selectedRepo.owner}/{selectedRepo.name}&nbsp;
              {repoDetails &&
                (repoDetails.isPrivate
                  ? <span className="type info">Private</span>
                  : <span className="type">Public</span>
                )
              }
            </h3>
            {repoDetails && <small>Updated {moment(Date.parse(repoDetails.updatedAt)).fromNow()}</small>}
          </header>

          <header className={loading? 'search loading' : 'search'}>
            <input
              type="text"
              ref='repoInput'
              className={inputClassname}
              onKeyPress={::this.handleKeyPress}
              placeholder="Put your repository name and hit enter" />
            <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
              <path d="M0 0h24v24H0z" fill="none"></path>
            </svg>
          </header>
        </section>
      </Modal>
    )
  }
}
