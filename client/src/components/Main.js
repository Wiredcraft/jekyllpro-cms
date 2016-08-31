/* global API_BASE_URL */
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Form from 'react-jsonschema-form'

import { defaultMarkdownText, defaultSchemaText } from '../constants/defaultText'
import { SUPPORTED_TYPE } from '../constants/types'
import { parseYamlInsideMarkdown } from '../helpers/markdown'
import 'normalize.css/normalize.css'
import 'styles/main.scss'
import { confirmUserIsLogin } from '../actions/userAction'


// TODO: remove linePattern
@connect(mapStateToProps, mapDispatchToProps)
export default class AppComponent extends React.Component {
  constructor() {
    super()
    this.state = {
      schemaCanBeParsed: true,
      markdownText: defaultMarkdownText,
      formSchema: { type: 'object', properties: {} },
      resultMarkdown: ''
    }
  }

  componentDidMount() {
    const { confirmUserIsLogin } = this.props

    confirmUserIsLogin()
  }

  componentDidUpdate(preProps) {
    const { isLogin } = this.props
    if(isLogin && !preProps.isLogin) this.updateEditFrom()
  }

  checkSchema() {
    const { schemaInput } = this.refs
    let schemaCanBeParsed = true
    try {
      const obj = JSON.parse(schemaInput.value)
      schemaCanBeParsed = (typeof obj === 'object') && obj.length > 0
      if(schemaCanBeParsed) {
        for (let i = 0; i < obj.length; i++) {
          if(SUPPORTED_TYPE.every(d => obj[i].type !== d)) {
            schemaCanBeParsed = false
            break
          }
        }
      }
    } catch (e) {
      schemaCanBeParsed = false
    }
    this.setState({ schemaCanBeParsed })
    if(schemaCanBeParsed) this.updateEditFrom()
  }

  login() {
    const url = `${API_BASE_URL}/api/auth/github`
    window.location = url
  }

  updateEditFrom() {
    const { schemaInput } = this.refs
    let { markdownText, schemaCanBeParsed, formSchema } = this.state
    const docConfigObj = parseYamlInsideMarkdown(markdownText)
    if(!docConfigObj) return

    const schemaObj = JSON.parse(schemaInput.value)
    if (!schemaCanBeParsed) return
    formSchema.properties = {}
    for (let i = 0; i < schemaObj.length; i++) {
      if(!schemaObj[i].name) continue
      const defaultValue = docConfigObj[schemaObj[i].target]
      formSchema.properties[schemaObj[i].name] = {
        default: defaultValue,
        title: schemaObj[i].name,
        type: schemaObj[i].type
      }
    }
    this.setState({ formSchema })
  }

  updateMarkdown() {
    const { schemaCanBeParsed } = this.state
    const { markdownInput } = this.refs

    this.setState({ markdownText: markdownInput.value })

    if (schemaCanBeParsed) {
      setTimeout(() => this.updateEditFrom(), 20)
    }
  }

  updateResult(formData) {
    const { schemaInput } = this.refs
    let { markdownText, schemaCanBeParsed } = this.state
    const docConfigObj = parseYamlInsideMarkdown(markdownText)
    if(!docConfigObj) return

    const schemaObj = JSON.parse(schemaInput.value)
    if (!schemaCanBeParsed) return
    for (let i = 0; i < schemaObj.length; i++) {
      const linePattern = new RegExp(schemaObj[i].target + ': ?[\\w 、\/]*')

      const prePattern = new RegExp(schemaObj[i].target + ': ?')
      let newValue = formData[schemaObj[i].name]
      const preText = prePattern.exec(markdownText)[0]
      markdownText = markdownText.replace(linePattern, preText + newValue)
    }
    this.setState({ resultMarkdown: markdownText })
  }

  render() {
    const {
      formSchema,
      markdownText,
      resultMarkdown,
      schemaCanBeParsed
    } = this.state
    const { isLogin } = this.props

    return isLogin ? (
      <div>
        <h3>Schema</h3>
        <textarea
          defaultValue={defaultSchemaText}
          onChange={() => this.checkSchema()}
          ref='schemaInput'
          className={schemaCanBeParsed ? '' : 'error'}
        />
        <h3>Original Markdown</h3>
        <textarea
          defaultValue={markdownText}
          ref='markdownInput'
          onChange={() => this.updateMarkdown()}
        />
        <h3>Edit From</h3>
        <Form
          onSubmit={res => this.updateResult(res.formData)}
          schema={formSchema}
          uiSchema={{
            // Parse uiSchema dynamically
            date: { 'ui:widget': 'date' }
          }}
        />
        <h3>Result</h3>
        <textarea value={resultMarkdown} />
      </div>
    ) : (
      <button onClick={() => this.login()}>Login</button>
    )
  }
}

function mapStateToProps(state) {
  return {
    isLogin: state.user.get('isLogin')
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({ confirmUserIsLogin }, dispatch)
}
