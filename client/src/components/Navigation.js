import { connect } from 'react-redux'
import React, { Component } from 'react'


@connect(mapStateToProps)
export default class Navigation extends Component {
  render() {
    const { schemas } = this.props
    return (
      <div id='navigation'>
        <section className='body'>
          {
            schemas && schemas.map((d, i) => (
              <a key={i}>
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
    schemas: state.repo.get('schemas')
  }
}
