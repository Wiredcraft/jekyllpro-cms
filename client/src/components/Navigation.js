import { connect } from 'react-redux'
import React, { Component } from 'react'


@connect(mapStateToProps)
export default class Navigation extends Component {
  constructor() {
    super()
    this.state = { selectedItemIndex: undefined }
  }

  navigate(i) {
    this.setState({ selectedItemIndex: i })
  }

  render() {
    const { filesMeta } = this.props
    const { selectedItemIndex } = this.state

    return (
      <div id='navigation'>
        <section className='body'>
          {
            filesMeta && filesMeta.map((d, i) => (
              <a
                className={selectedItemIndex === i ? 'active' : ''}
                key={i}
                onClick={() => this.navigate(i)}
              >
                <h2>{ d.name }</h2>
              </a>
            ))
          }
        </section>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    filesMeta: state.repo.get('filesMeta')
  }
}
