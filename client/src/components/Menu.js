import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import React, { Component } from 'react'

import { getAllBranch, checkoutBranch } from '../actions/repoActions'

@connect(mapStateToProps, mapDispatchToProps)
export default class Menu extends Component {

  componentWillMount() {
    this.props.getAllBranch()
  }

  handleBranchChange(evt) {
    this.props.checkoutBranch(evt.target.value)
  }

  render () {
    const { branches, currentBranch } = this.props

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
          <a className="active">
            <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
            	<path strokeLinejoin="round" d="M 19,7L 9,7L 9,5L 19,5M 15,15L 9,15L 9,13L 15,13M 19,11L 9,11L 9,9L 19,9M 20,2L 8,2C 6.9,2 6,2.9 6,4L 6,16C 6,17.1 6.9,18 8,18L 20,18C 21.1,18 22,17.1 22,16L 22,4C 22,2.9 21.1,2 20,2 Z M 4,6L 2,6L 2,20C 2,21.1 2.9,22 4,22L 18,22L 18,20L 4,20L 4,6 Z "></path>
            </svg>
            Posts
          </a>
          <a>
            <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
            	<path strokeLinejoin="round" d="M 19,7L 9,7L 9,5L 19,5M 15,15L 9,15L 9,13L 15,13M 19,11L 9,11L 9,9L 19,9M 20,2L 8,2C 6.9,2 6,2.9 6,4L 6,16C 6,17.1 6.9,18 8,18L 20,18C 21.1,18 22,17.1 22,16L 22,4C 22,2.9 21.1,2 20,2 Z M 4,6L 2,6L 2,20C 2,21.1 2.9,22 4,22L 18,22L 18,20L 4,20L 4,6 Z "></path>
            </svg>
            Team
          </a>
          <a>
            <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
            	<path strokeLinejoin="round" d="M 19,7L 9,7L 9,5L 19,5M 15,15L 9,15L 9,13L 15,13M 19,11L 9,11L 9,9L 19,9M 20,2L 8,2C 6.9,2 6,2.9 6,4L 6,16C 6,17.1 6.9,18 8,18L 20,18C 21.1,18 22,17.1 22,16L 22,4C 22,2.9 21.1,2 20,2 Z M 4,6L 2,6L 2,20C 2,21.1 2.9,22 4,22L 18,22L 18,20L 4,20L 4,6 Z "></path>
            </svg>
            Products
          </a>
          <h3>Content</h3>
          <a>
            <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
            	<path strokeWidth="0.2" strokeLinejoin="round" d="M 12.9994,8.99807L 12.9994,3.49807L 18.4994,8.99807M 5.99939,1.99807C 4.89438,1.99807 4.0094,2.89406 4.0094,3.99807L 3.99939,19.9981C 3.99939,21.1021 4.88538,21.9981 5.98938,21.9981L 17.9994,21.9981C 19.1034,21.9981 19.9994,21.1021 19.9994,19.9981L 19.9994,7.99807L 13.9994,1.99807L 5.99939,1.99807 Z "></path>
            </svg>
            Pages
          </a>
          <a>
            <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
            	<path strokeWidth="0.2" strokeLinejoin="round" d="M 8.49939,13.4981L 10.9994,16.5041L 14.4994,11.9981L 18.9994,17.9981L 4.99939,17.9981M 20.9994,18.9981L 20.9994,4.99807C 20.9994,3.89306 20.1034,2.99807 18.9994,2.99807L 4.99939,2.99807C 3.89539,2.99807 2.99939,3.89306 2.99939,4.99807L 2.99939,18.9981C 2.99939,20.1031 3.89539,20.9981 4.99939,20.9981L 18.9994,20.9981C 20.1034,20.9981 20.9994,20.1031 20.9994,18.9981 Z "></path>
            </svg>
            Media
          </a>
          <a>
            <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
            	<path strokeWidth="0.2" strokeLinejoin="round" d="M 4.00002,3L 20,3C 21.1046,3 22,3.89543 22,5L 22,20C 22,21.1046 21.1046,22 20,22L 4.00001,22C 2.89544,22 2.00001,21.1046 2.00001,20L 2.00002,5C 2.00002,3.89543 2.89545,3 4.00002,3 Z M 4.00002,7L 4.00001,10L 8,10L 8,7.00001L 4.00002,7 Z M 10,7.00001L 9.99999,10L 14,10L 14,7.00001L 10,7.00001 Z M 20,10L 20,7L 16,7.00001L 16,10L 20,10 Z M 4.00002,12L 4.00002,15L 8,15L 8,12L 4.00002,12 Z M 4.00001,20L 8,20L 8,17L 4.00002,17L 4.00001,20 Z M 9.99999,12L 9.99999,15L 14,15L 14,12L 9.99999,12 Z M 9.99999,20L 14,20L 14,17L 9.99999,17L 9.99999,20 Z M 20,20L 20,17L 16,17L 16,20L 20,20 Z M 20,12L 16,12L 16,15L 20,15L 20,12 Z "></path>
            </svg>
            Data
          </a>
          <h3>Others</h3>
          <a>
            <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
            	<path strokeWidth="0.2" strokeLinejoin="round" d="M 5,2.9978C 3.89125,2.9978 2.9975,3.89136 2.9975,5L 2.9975,18.9988C 2.9975,20.1075 3.89125,21.0012 5,21.0012L 11.0013,21.0012L 11.0013,2.9978M 12.9975,2.9978L 12.9975,11.0012L 21.0013,11.0012L 21.0013,5C 21.0013,3.89136 20.1075,2.9978 18.9988,2.9978M 12.9975,12.9975L 12.9975,21.0012L 18.9988,21.0012C 20.1075,21.0012 21.0013,20.1075 21.0013,18.9988L 21.0013,12.9975"></path>
            </svg>
            Layouts
          </a>
          <a>
            <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
            	<path strokeWidth="1.33333" strokeLinejoin="miter" d="M 21,3L 3,3C 1.9,3 1,3.9 1,5L 1,19C 1,20.1 1.9,21 3,21L 21,21C 22.1,21 23,20.1 23,19L 23,5C 23,3.9 22.1,3 21,3 Z M 21,19L 12,19L 12,13L 21,13L 21,19 Z "></path>
            </svg>
            Includes
          </a>
          <a>
            <svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">
            	<path strokeWidth="1.33333" strokeLinejoin="miter" d="M 5,3L 7,3L 7,5L 5,5L 5,10C 5,11.1046 4.10457,12 3,12C 4.10457,12 5,12.8954 5,14L 5,19L 7,19L 7,21L 5,21C 3.92841,20.7321 3,20.1046 3,19L 3,15C 3,13.8954 2.10457,13 1,13L 0,13L 0,11L 1,11C 2.10457,11 3,10.1046 3,9L 3,5C 3,3.89539 3.89543,3 5,3 Z M 19,3.00001C 20.1046,3.00001 21,3.8954 21,5.00001L 21,9.00001C 21,10.1046 21.8954,11 23,11L 24,11L 24,13L 23,13C 21.8954,13 21,13.8954 21,15L 21,19C 21,20.1046 20.0716,20.7321 19,21L 17,21L 17,19L 19,19L 19,14C 19,12.8954 19.8954,12 21,12C 19.8954,12 19,11.1046 19,10L 19,5.00001L 17,5.00001L 17,3.00001L 19,3.00001 Z M 12,15C 12.5523,15 13,15.4477 13,16C 13,16.5523 12.5523,17 12,17C 11.4477,17 11,16.5523 11,16C 11,15.4477 11.4477,15 12,15 Z M 8,15C 8.55229,15 9,15.4477 9,16C 9,16.5523 8.55228,17 8,17C 7.44772,17 7,16.5523 7,16C 7,15.4477 7.44771,15 8,15 Z M 16,15C 16.5523,15 17,15.4477 17,16C 17,16.5523 16.5523,17 16,17C 15.4477,17 15,16.5523 15,16C 15,15.4477 15.4477,15 16,15 Z "></path>
            </svg>
            Schemas
          </a>
        </section>

        <footer className="footer">
          <a>
            Profile
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
    branches: state.repo.get('branches'),
    currentBranch: state.repo.get('currentBranch')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ getAllBranch, checkoutBranch }, dispatch)
}
