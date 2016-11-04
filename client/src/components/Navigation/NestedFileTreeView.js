import React, { Component } from 'react'
import FileIcon from '../svg/FileIcon'
import FolderIcon from '../svg/FolderIcon'
import ClosedFolderIcon from '../svg/ClosedFolderIcon'

const ExpendableFolderIcon = (props) =>{
  if (props.open) {
    return <FolderIcon />
  }
  return <ClosedFolderIcon />
}

const FileView = (props) => {
  const { file, onclick, selected } = props
  const onclickFn = onclick().bind(null, file.path)
  return (
    <li key={`file-${file.path}`} onClick={onclickFn}>
      <a className={selected === file.path ? 'active' : ''}>
        <FileIcon /><span>{file.name}</span>
      </a>
    </li>
  )
}

class FolderView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false
    }
  }

  toggleFolder () {
    const { open } = this.state
    this.setState({ open: !open })
  }

  render () {
    const { name, folderObj, onclick, selected } = this.props
    const { open } = this.state
    let styl = open ? {'display': 'block'} : {'display': 'none'}

    return (
      <li key={`folder-${name}`} className={open ? 'open' : ''}>
        <a onClick={::this.toggleFolder}>
          <ExpendableFolderIcon open={open} /><span>{name}</span>
        </a>
        <ul style={styl}>
          {
            folderObj && folderObj['_contents'].map(f => {
              return (
                <FileView
                  key={`file-${f.path}`}
                  file={f}
                  onclick={onclick}
                  selected={selected} />
              )
            })
          }
          {
            folderObj && Object.keys(folderObj)
            .filter(k => { return k !== '_contents' })
            .map(prop => {
              return (
                <FolderView
                  key={`folder-${name}-${prop}`}
                  name={prop}
                  folderObj={folderObj[prop]}
                  onclick={onclick}
                  selected={selected} />
              )
            })
          }
        </ul>
      </li>
    )
  }
}

const NestedFileTreeView = (props) => {
  const { directory, onclick, selected } = props
  return (
    <ul>
      {
        directory && directory['_contents'].map(file => {
          return (
            <FileView
              key={`root-file-${file.path}`}
              file={file}
              onclick={onclick}
              selected={selected} />
          )
        })
      }
      {
        directory && Object.keys(directory)
        .filter(k => { return k !== '_contents' })
        .map(prop => {
          return (
            <FolderView
              key={`root-folder-${prop}`}
              folderObj={directory[prop]}
              name={prop}
              onclick={onclick}
              selected={selected} />
          )
        })
      }
    </ul>
  )
}

export default NestedFileTreeView
