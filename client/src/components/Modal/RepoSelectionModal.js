import React, { Component } from 'react'
import Modal from 'react-modal'
import Cookie from 'js-cookie'
import ModalCustomStyle from './index'
import { getUserRepos } from '../../helpers/api'

var searchTimeout;

export default class RepoSelectionModal extends Component {
  constructor() {
    super()
    this.state = {
      repos: [],
      filteredRepos: [],
      selectedRepo: {owner: Cookie.get('repoOwner') || 'n', name: Cookie.get('repoName') || 'a'}
    }
  }

  componentDidMount () {
    if (this.state.repos.length > 0) return
    getUserRepos({})
      .then(list => {
        this.setState({repos: list, filteredRepos: list}, () => {
          this.getRepoInfoFromList(list)
        })
      })
  }

  getRepoInfoFromList (list) {
    const { selectedRepo } = this.state
    let repo = list.filter(r => {
      return (r.name === selectedRepo.name) && (r.owner.login === selectedRepo.owner)
    })
    this.setState({selectedRepoUpdatedAt: repo.updated_at, selectedRepoIsPrivate: repo.private})
  }

  saveSelectedRepoToCookie () {
    Cookie.set('repoOwner', this.state.owner)
    Cookie.set('repoName', this.state.name)
  }

  handleInput (evt) {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // let inputText = evt.target.value
    searchTimeout = setTimeout(this.searchRepo.bind(this, evt.target.value), 500)

  }

  searchRepo (text) {
    let list = this.state.repos
    
    let filtered = list.filter(l => {
      return l.full_name.indexOf(text) > -1
    })
    this.setState({filteredRepos: filtered})
  }

  render () {
    const { afterOpen, onclose, isOpen } = this.props
    const { selectedRepo, selectedRepoIsPrivate, selectedRepoUpdatedAt } = this.state
    return (
      <Modal
        style={ModalCustomStyle}
        onAfterOpen={afterOpen}
        onRequestClose={onclose}
        isOpen={isOpen}>
        <header className="header">
          <a className="close" onClick={onclose}>Close</a>
          <h2>Select a repository</h2>
        </header>
        <section className="body">
          <header className="selected">
            <h3>
              {selectedRepo.owner}/{selectedRepo.name}
              {selectedRepoIsPrivate ? <span className="type info">Private</span> : <span className="type">Public</span>}
            </h3>
            {selectedRepoUpdatedAt && <small>Updated {selectedRepoUpdatedAt}</small>}
          </header>

          <header className="search">
            <input
              type="text"
              onChange={::this.handleInput}
              placeholder="Search repositories by name" />
            <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
              <path d="M0 0h24v24H0z" fill="none"></path>
            </svg>
          </header>
          <div className="default">Search repositories by keywords</div>
          <ul className='list results'>
          {
            this.state.filteredRepos.map(repo => {
              return (
                <li key={repo.id}>
                  <h3>
                    {repo.full_name }
                    {repo.private ? <span className="type info">Private</span> : <span className="type">Public</span>}
                  </h3>
                  <small>updated at {repo.updated_at}</small>
                </li>
              )
            })
          }
          </ul>
        </section>
      </Modal>
    )
  }
}
