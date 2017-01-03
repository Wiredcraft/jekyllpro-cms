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

  componentDidUpdate(prevProps, prevState) {
    const { updating } = this.state
    const { currentBranch, repoUpdateSignal } = this.props

    if (updating) {
      return
    }

    if ((prevProps.currentBranch !== currentBranch) || (repoUpdateSignal && !prevProps.repoUpdateSignal)) {
      this.setState({ updating: true })

      checkJekyllProBuild(newBranch)
      .then((res) => {
        this.setState({
          isJekyllProClient: true,
          buildStatus: {
            url: res.url,
            status: res.status,
            hash: res.hash,
            lastUpdate: Date.now()
          },
          updating: false
        })
      })
      .catch((err) => {
        console.log(err)
        this.setState({ updating: false })
      })

      if (repoUpdateSignal) {
        this.props.resetUpdateSignal()
      }
    } 
  }

  handleHover() {
    const { currentBranch } = this.props
    const { buildStatus, updating } = this.state

    // do not update when last update was three seconds ago
    if (buildStatus && ((Date.now() - buildStatus.lastUpdate) < 1000 * 3)) {
      return
    }

    if (updating) {
      return
    }

    this.setState({ updating: true })

    checkJekyllProBuild(currentBranch)
    .then((res) => {
      this.setState({
        updating: false,
        isJekyllProClient: true,
        buildStatus: {
          url: res.url,
          status: res.status,
          hash: res.hash,
          lastUpdate: Date.now()
        }
      })
    })
    .catch((err) => {
      console.log(err)
      this.setState({ updating: false })
    })
  }

  render () {
    const { repoOwner, repoName, currentBranch } = this.props
    const { isJekyllProClient, buildStatus, updating } = this.state

    let repoUrl = `https://github.com/${repoOwner}/${repoName}/`
    let mainClass = isJekyllProClient
      ? updating ? 'website menu loading' : `website menu ${statusClassMapping[buildStatus.status]}`
      : 'website menu'

    return (
      <span className={mainClass}>
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
