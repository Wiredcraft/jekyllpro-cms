import React, { Component } from 'react'

export default class ImageLoader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  componentWillMount() {
    this.createLoader()
  }

  componentWillUnmount() {
    this.cleanUp()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.src !== prevProps.src) {
      this.setState({ loading: true })
      this.createLoader()
    }
  }

  handleLoad(evt) {
    this.setState({ loading: false })
  }

  handleError(evt) {
    this.setState({ loading: false })
  }

  createLoader() {
    this.cleanUp()
    this.image = new Image()
    this.image.onload = ::this.handleLoad
    this.image.onerror = ::this.handleError
    this.image.src = this.props.src
  }

  cleanUp() {
    if (this.image) {      
      this.image.onload = null
      this.image.onerror = null
      this.image = null    
    }
  }

  render() {
    const { loading } = this.state

    return (
      <div className='imageWrapper' style={{textAlign: 'center'}}>
        { loading ? (<img
            src='https://assets-cdn.github.com/images/spinners/octocat-spinner-128.gif'
            style={{width: '40px'}} />) : <img src={this.props.src} />
        }
      </div>
    )
  }
}
