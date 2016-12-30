import React, { Component } from 'react'
import moment from 'moment'
import { checkJekyllProBuild } from '../../helpers/api'

import CloudIcon from '../svg/CloudIcon'
import PlusIcon from '../svg/PlusIcon'
import ExternalLinkIcon from '../svg/ExternalLinkIcon'
import RemoveIcon from '../svg/RemoveIcon'
let timeout = null

const statusClassMapping = {
  'success': 'ok',
  'failed': 'error',
  'running': 'pending',
  'undefined': ''
}

export default class JekyllProStatus extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isJekyllProClient: false,
      updating: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    const newBranch = nextProps.currentBranch
    if (this.props.currentBranch !== nextProps.currentBranch) {
      this.setState({ updating: true })

      checkJekyllProBuild(newBranch)
      .then(({ url, status, hash }) => {
        this.setState({
          isJekyllProClient: true,
          buildStatus: { url, status, hash, lastUpdate: Date.now() },
          updating: false
        })
      })
    }
  }

  handleHover() {
    const { currentBranch } = this.props
    const { buildStatus, updating } = this.state

    // do not update when last update was a minute ago
    if (buildStatus && ((Date.now() - buildStatus.lastUpdate) < 1000 * 60)) {
      return
    }

    if (updating) {
      return
    }

    this.setState({ updating: true })

    checkJekyllProBuild(currentBranch)
    .then(({ url, status, hash }) => {
      this.setState({
        updating: false,
        isJekyllProClient: true,
        buildStatus: { url, status, hash, lastUpdate: Date.now() }
      })
    })
  }

  render () {
    const { repoOwner, repoName, currentBranch } = this.props
    const { isJekyllProClient, buildStatus, updating } = this.state

    let repoUrl = `https://github.com/${repoOwner}/${repoName}/`

    return (
      <span className='website menu'>
        <a className="view item tooltip-bottom" href='#' onMouseEnter={::this.handleHover}>
          <CloudIcon />
          Website
        </a>   
        { 
          !isJekyllProClient &&
          <div className='options'><a><PlusIcon/> Enable JekyllPro hosting </a></div>
        }
        {
          isJekyllProClient && buildStatus &&
          <div className={updating ? 'options loading' : 'options'}>
            <span className={`message ${statusClassMapping[buildStatus.status]}`}>
              {`Update ${buildStatus.status} `}
              {moment(new Date(buildStatus.lastUpdate)).fromNow()}
            </span>
            <a href={buildStatus.url} target='_blank'><ExternalLinkIcon /> See live site</a>
            <hr />
            <a href={`${repoUrl}commit/${buildStatus.hash}`} target='_blank'>
              <ExternalLinkIcon /> Current version #{`${buildStatus.hash.slice(0, 7)}`}
            </a>
            <hr />
            <a className='danger'>
              <RemoveIcon />Disable JekyllPro hosting
            </a>
          </div>
        }
      </span>
    )
  }
}
