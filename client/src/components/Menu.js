import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import { getAllBranch, checkoutBranch } from '../actions/repoActions'
import CollectionIcon from './svg/CollectionIcon'
import PageIcon from './svg/PageIcon'
import LayoutIcon from './svg/LayoutIcon'

const posts = require('../schema/posts.json')
const team = require('../schema/team.json')
const pages = require('../schema/pages.json')
const layouts = require('../schema/layouts.json')
//Hard coded folder data
function getFolderStructure() {
  let project = {'collection': [], 'content': [], 'others': []};
  
  [posts, team, pages, layouts].forEach((item) => {
    let temp = { title: item.title, dir: item.jekyll.dir }
    if (item.jekyll.type) {
      switch (item.jekyll.type) {
        case 'collection':
          project['collection'].push(temp)
          break;
        case 'content':
          project['content'].push(temp)
          break;
        default:
          project['others'].push(temp)
      }
    } else {
      project['others'].push(temp)
    }
  })
  return project
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Menu extends Component {

  componentWillMount() {
    this.props.getAllBranch()
  }

  handleBranchChange(evt) {
    this.props.checkoutBranch(evt.target.value)
  }

  render () {
    const { branches, currentBranch, avatar, userName } = this.props
    const project = getFolderStructure()
    // console.log(team)
    return (
      <nav id="menu">
        <section className="body">
          <h3>Branch</h3>
          <span className="select">
            <select value={currentBranch} onChange={::this.handleBranchChange}>
              {branches && branches.map((b) => {
                return (
                  <option key={b.name}>{ b.name }</option>
                )
              })}
            </select>
          </span>
          <h3>Collections</h3>
          {
            project['collection'].map(item => {
              return(
                <a key={item.dir}>
                  <CollectionIcon />
                  {item.title}
                </a>
              )
            })
          }
          <h3>Content</h3>
          {
            project['content'].map(item => {
              return(
                <a key={item.dir}>
                  <PageIcon />
                  {item.title}
                </a>
              )
            })
          }
          <h3>Others</h3>
          {
            project['others'].map(item => {
              return(
                <a key={item.dir}>
                  <LayoutIcon />
                  {item.title}
                </a>
              )
            })
          }
        </section>

        <footer className="footer">
          <a onClick={evt => {this.setState({showProfileModel: true})}}>
            <img src={avatar} />
            {userName}
          </a>
          <a className="settings">
            <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
              <path strokeWidth="0.2" strokeLinejoin="round" d="M 11.9994,15.498C 10.0664,15.498 8.49939,13.931 8.49939,11.998C 8.49939,10.0651 10.0664,8.49805 11.9994,8.49805C 13.9324,8.49805 15.4994,10.0651 15.4994,11.998C 15.4994,13.931 13.9324,15.498 11.9994,15.498 Z M 19.4284,12.9741C 19.4704,12.6531 19.4984,12.329 19.4984,11.998C 19.4984,11.6671 19.4704,11.343 19.4284,11.022L 21.5414,9.36804C 21.7294,9.21606 21.7844,8.94604 21.6594,8.73004L 19.6594,5.26605C 19.5354,5.05005 19.2734,4.96204 19.0474,5.04907L 16.5584,6.05206C 16.0424,5.65607 15.4774,5.32104 14.8684,5.06903L 14.4934,2.41907C 14.4554,2.18103 14.2484,1.99805 13.9994,1.99805L 9.99939,1.99805C 9.74939,1.99805 9.5434,2.18103 9.5054,2.41907L 9.1304,5.06805C 8.52039,5.32104 7.95538,5.65607 7.43939,6.05206L 4.95139,5.04907C 4.7254,4.96204 4.46338,5.05005 4.33939,5.26605L 2.33939,8.73004C 2.21439,8.94604 2.26938,9.21606 2.4574,9.36804L 4.5694,11.022C 4.5274,11.342 4.49939,11.6671 4.49939,11.998C 4.49939,12.329 4.5274,12.6541 4.5694,12.9741L 2.4574,14.6271C 2.26938,14.78 2.21439,15.05 2.33939,15.2661L 4.33939,18.73C 4.46338,18.946 4.7254,19.0341 4.95139,18.947L 7.4404,17.944C 7.95639,18.34 8.52139,18.675 9.1304,18.9271L 9.5054,21.577C 9.5434,21.8151 9.74939,21.998 9.99939,21.998L 13.9994,21.998C 14.2484,21.998 14.4554,21.8151 14.4934,21.577L 14.8684,18.9271C 15.4764,18.6741 16.0414,18.34 16.5574,17.9431L 19.0474,18.947C 19.2734,19.0341 19.5354,18.946 19.6594,18.73L 21.6594,15.2661C 21.7844,15.05 21.7294,14.78 21.5414,14.6271L 19.4284,12.9741 Z "></path>
            </svg>
            Settings
          </a>
        </footer>
      </nav>
    )
  }
}

function mapStateToProps(state) {
  return {
    avatar: state.user.get('avatar'),
    userName: state.user.get('userName'),
    branches: state.repo.get('branches'),
    currentBranch: state.repo.get('currentBranch')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ getAllBranch, checkoutBranch }, dispatch)
}
