import React, { Component } from 'react'
import Modal from 'react-modal'
import ModalCustomStyle from './index'

export default class SettingModal extends Component {

  componentDidUpdate(prevProps) {
    const {isBranchPrivate, branches} = this.props
    if (branches && prevProps.branches !== branches) {
      branches.map((b) => {
        return isBranchPrivate(b.name)
          .then(obj => {
            var tmp = {}
            tmp[b.name] = obj.isPrivate
            return this.setState(tmp)
          })
      })
    }
  }

  render () {
    var props = this.props

    return (
      <Modal
        style={ModalCustomStyle}
        onAfterOpen={props.afterOpen}
        onRequestClose={props.onclose}
        isOpen={props.isOpen}>
          <header className="header">
            <a className="close" onClick={props.onclose}>Close</a>
            <h2>Settings</h2>
          </header>
          <section className="body">
            <ul className="list branches">
              <li className="active">
                <h3>master <span className="type ok">Public</span> <span className="type info">Variants</span></h3>
                <section className="details">
                  <div className="setting">
                    <div className="field">
                      <label className="switch">
                        <input type="checkbox" id="branch-master-private" />
                        <div className="slider"></div>
                      </label>
                      <label htmlFor="branch-master-private"><strong>Private</strong></label>
                      <small className="description"></small>
                    </div>
                  </div>
                  <div className="setting">
                    <h4>Make the following branches available as variants:</h4>
                    <div className="field">
                      <label className="switch">
                        <input type="checkbox" id="branch-master-variant-gh-pages" checked="" />
                        <div className="slider"></div>
                      </label>
                      <label htmlFor="branch-master-variant-gh-pages">gh-pages</label>
                    </div>
                    <div className="field">
                      <label className="switch">
                        <input type="checkbox" id="branch-master-variant-exp-fp-1" />
                        <div className="slider"></div>
                      </label>
                      <label htmlFor="branch-master-variant-exp-fp-1">exp-fp-1</label>
                    </div>
                    <div className="field">
                      <label className="switch">
                        <input type="checkbox" id="branch-master-variant-super-long-branch-name-htmlFor-testing" />
                        <div className="slider"></div>
                      </label>
                      <label htmlFor="branch-master-variant-super-long-branch-name-for-testing">super-long-branch-name-for-testing</label>
                    </div>
                  </div>
                </section>
              </li>
              {
                props.branches && props.branches.map((b, i) => {
                  return (
                    <li key={i}>
                    <h3>
                      {b.name}
                      {this.state && !this.state[b.name] && <span className="type ok">Public</span>}
                      {this.state && this.state[b.name] && <span className="type">Private</span>}                      
                    </h3>
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
