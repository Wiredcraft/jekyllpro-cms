import React, { Component } from 'react'
import Select from 'react-select'

export default class CustomSelectWidget extends Component {
  constructor (props) {
    super(props)
    if (props.multiple) {
      this.state = {
        selected:
          (props.value &&
            props.value.map(v => {
              return { label: v, value: v }
            })) ||
          []
      }
    } else {
      this.state = {
        selected:
          (props.value && { label: props.value, value: props.value }) ||
          undefined
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    const { value } = nextProps
    if (value && value !== this.props.value) {
      if (this.props.multiple) {
        this.setState({
          selected: value.map(v => {
            return { label: v, value: v }
          })
        })
      } else {
        this.setState({ selected: { label: value, value: value } })
      }
    }
  }

  handleChange (selected) {
    const { multiple, onChange, required } = this.props
    if (multiple) {
      let vals = selected.map(t => {
        return t.value
      })
      // when `required` is true, it does not pass down to this component,
      // maybe a bug of react-JSONSchema-form
      vals =
        required || required === undefined
          ? (vals.length && vals) || undefined
          : vals
      onChange(vals)
    } else {
      onChange(selected.value)
    }
  }

  render () {
    const {
      // schema,
      id,
      options,
      // value,
      required,
      disabled,
      readonly,
      multiple,
      autofocus
      // onChange
    } = this.props

    return (
      <Select
        id={id}
        clearable={false}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        autoFocus={autofocus}
        multi={multiple}
        value={this.state.selected}
        options={options.enumOptions}
        onChange={::this.handleChange}
      />
    )
  }
}
