import React, { Component } from 'react'
import debounce from 'lodash.debounce'
import Codemirror from 'react-codemirror'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/htmlmixed/htmlmixed'
// import 'codemirror/addon/display/autorefresh'
import 'codemirror/addon/display/panel'
import FileManagerModal from '../Modal/FileManagerModal'

const cmOptions = {
  theme: "default",
  height: "auto",
  viewportMargin: Infinity,
  mode: 'markdown',
  lineNumbers: false,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2
}

const panelButtons = [
  {
    class: 'button bold tooltip-bottom icon',
    label: '<svg class="icon icon-bold"><use xlink:href="#icon-bold"></use></svg><span>Bold text</span>',
    callback: function (codeMirror) {
      var selection = codeMirror.getSelection()
      codeMirror.replaceSelection('**' + selection + '**')
      if (!selection) {
        var cursorPos = codeMirror.getCursor()
        codeMirror.setCursor(cursorPos.line, cursorPos.ch - 2)
      }
    }
  },
  {
    class: 'button italic tooltip-bottom icon',
    label: '<svg class="icon icon-italic"><use xlink:href="#icon-italic"></use></svg><span>Italic text</span>',
    callback: function (codeMirror) {
      var selection = codeMirror.getSelection()
      codeMirror.replaceSelection('*' + selection + '*')
      if (!selection) {
        var cursorPos = codeMirror.getCursor()
        codeMirror.setCursor(cursorPos.line, cursorPos.ch - 1)
      }
    }
  },
  {
    class: 'button h1 tooltip-bottom icon',
    label: '<svg class="icon icon-h1"><use xlink:href="#icon-h1"></use></svg><span>Add h1 title</span>',
    callback: function (codeMirror) {
      var selection = codeMirror.getSelection()
      codeMirror.replaceSelection('# ' + selection)
    }
  },
  {
    class: 'button h2 tooltip-bottom icon',
    label: '<svg class="icon icon-h2"><use xlink:href="#icon-h2"></use></svg><span>Add h2 title</span>',
    callback: function (codeMirror) {
      var selection = codeMirror.getSelection()
      codeMirror.replaceSelection('## ' + selection)
    }
  },
  {
    class: 'button h3 tooltip-bottom icon',
    label: '<svg class="icon icon-h3"><use xlink:href="#icon-h3"></use></svg><span>Add h3 title</span>',
    callback: function (codeMirror) {
      var selection = codeMirror.getSelection()
      codeMirror.replaceSelection('### ' + selection)
    }
  },
  {
    class: 'button ul tooltip-bottom icon',
    label: '<svg class="icon icon-ul"><use xlink:href="#icon-ul"></use></svg><span>Add a bulleted list</span>',
    callback: function (codeMirror) {
      var selection = codeMirror.getSelection()
      var lines = selection.split('\n')
      lines = lines.join('\n- ')

      codeMirror.replaceSelection('- ' + lines)
    }
  },
  {
    class: 'button ol tooltip-bottom icon',
    label: '<svg class="icon icon-ol"><use xlink:href="#icon-ol"></use></svg><span>Add a numbered list</span>',
    callback: function (codeMirror) {
      var selection = codeMirror.getSelection()
      var lines = selection.split('\n')
      lines = lines.map((text, idx) => { return (++idx) + '. ' + text })
      lines = lines.join('\n')

      codeMirror.replaceSelection(lines)
    }
  },
  {
    class: 'button link tooltip-bottom icon',
    label: '<svg class="icon icon-link"><use xlink:href="#icon-link"></use></svg><span>Add a link</span>',
    callback: function (codeMirror) {
      var selection = codeMirror.getSelection()
      var text = ''
      var link = 'url'
      var cursorPos = codeMirror.getCursor()
      if (selection.match(/^https?:\/\//)) {
        link = selection
      } else {
        text = selection
      }
      codeMirror.replaceSelection('[' + text + '](' + link + ')')

      if (!selection) {
        codeMirror.setCursor(cursorPos.line, cursorPos.ch + 1)
      } else if (link) {
        codeMirror.setCursor(cursorPos.line, cursorPos.ch + 1 - link.length)
      } else {
        codeMirror.setCursor(cursorPos.line, cursorPos.ch - 4 + text.length)
      }
    }
  }
]

export default class CustomCodeMirror extends Component {
  constructor(props) {
    super(props)
    this.state = { modalIsOpen: false }
  }

  componentDidMount() {
    const editor = this.refs.cmBody.getCodeMirror()
    const node = document.createElement('div')
    node.className = 'controls bundle'
    this.initPanelButtons(node, editor)

    this.panel = editor.addPanel(node, {position: 'top'})
  }

  componentWillUnmount() {
    this.destroyPanelButtons()
    this.panel.clear()
  }

  initPanelButtons(panel, codeMirror) {
    this.panelButtons = panelButtons.map(btn => {
      let btnNode = panel.appendChild(document.createElement('button'))
      let btnHandler = function(e) {
        e.preventDefault()
        codeMirror.focus()
        btn.callback(codeMirror)
      }
      btnNode.className = btn.class
      btnNode.innerHTML = btn.label
      btnNode.setAttribute('type', 'button')
      btnNode.addEventListener('click', btnHandler)

      return {node: btnNode, handler: btnHandler}
    })
    let insertBtn = panel.appendChild(document.createElement('button'))
    let insertBtnHandler = this.handleInsertBtn.bind(this)
    insertBtn.className = 'button insert tooltip-bottom icon'
    insertBtn.innerHTML = '<svg class="icon icon-images"><use xlink:href="#icon-images"></use></svg><span>Insert image</span>'
    insertBtn.setAttribute('type', 'button')
    insertBtn.addEventListener('click', insertBtnHandler)
    
    this.panelButtons.push({node: insertBtn, handler: insertBtnHandler})
  }

  destroyPanelButtons() {
    this.panelButtons.forEach(obj => {
      obj.node.removeEventListener('click', obj.handler)
    })
  }

  handleInsertBtn (e) {
    e.preventDefault()
    this.setState({ modalIsOpen: true })
  }

  onModalClose () {
    this.setState({ modalIsOpen: false })
  }

  handleModalSelect(filePath) {
    const img = `![](/${filePath})`
    const editor = this.refs.cmBody.getCodeMirror()
    editor.replaceSelection(img + editor.getSelection())
  }

  render() {
    var handler = debounce((code) => {
      this.props.onChange(code)
    }, 800)
    
    return (
      <div className='customCodeMirror'>
        <Codemirror ref='cmBody'
          value={this.props.value || ''}
          required={this.props.required}
          onChange={handler}
          options={cmOptions} />
        <FileManagerModal
          handleSelect={::this.handleModalSelect}
          onclose={::this.onModalClose}
          isOpen={this.state.modalIsOpen} />
      </div>
    )
  }
}
