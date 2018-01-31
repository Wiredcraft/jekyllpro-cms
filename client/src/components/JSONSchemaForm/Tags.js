import React, { Component } from 'react'
import Select, { Creatable } from 'react-select'

export default class Tags extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tags:
        (props.value &&
          props.value.map(v => {
            return { label: v, value: v }
          })) ||
        [],
      noResultsText: 'Type a few characters to create a tag'
    }
  }

  componentWillReceiveProps (nextProps) {
    const { value } = nextProps
    if (value && value !== this.props.value) {
      this.setState({
        tags: value.map(v => {
          return { label: v, value: v }
        })
      })
    }
  }

  handleChange (values) {
    this.setState({
      // tags: values,
      noResultsText: values.length
        ? 'Type already exists'
        : 'Type a few characters to create a tag'
    })
    this.props.onChange(
      values.map(t => {
        return t.value
      })
    )
  }

  render () {
    return (
      <Creatable
        placeholder='Enter tags...'
        noResultsText={this.state.noResultsText}
        multi
        value={this.state.tags}
        clearable={false}
        onChange={::this.handleChange}
      />
    )
  }
}
