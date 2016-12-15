import React, { Component } from 'react'

import UploaderIcon from '../svg/UploaderIcon'

export default class FileUploader extends Component {
  constructor() {
    super()
    this.state = {
      files: [],
      uploadBtnClass: 'button primary'
    }
  }

  handleFileInput(e){
    let files = e.target.files
    var allFiles = []
    for (var i = 0; i < files.length; i++) {

      let file = files[i]
      let reader = new FileReader()

      reader.readAsDataURL(file)

      reader.onload = (evt) => {
        let content = evt.target.result.replace(/^(.+,)/, '')
        let fileInfo = {
          name: file.name,
          type: file.type,
          size: Math.round(file.size / 1000)+' kB',
          base64: content
        }

        allFiles.push(fileInfo)

        if(allFiles.length == files.length){
          // Apply Callback function
          this.onDone(allFiles)
        }
      }
    }
  }

  onDone (files) {
    this.setState({ files: files })
  }

  uploadFile () {
    const { addNewFile, fileAdded, currentBranch, uploadFolder } = this.props
    let { files } = this.state
    let filepath = files[0].name
    if (uploadFolder) {
      //normalize path
      let p = uploadFolder.split('/')
      p = p.filter(s => {
        return s !== ''
      })
      p.push(files[0].name)
      filepath = p.join('/')
    }
    console.log(filepath)
    this.setState({ uploadBtnClass: 'button primary disabled processing'})
    addNewFile(currentBranch, filepath, files[0].base64, { encode: false })
      .then(() => {
        fileAdded(filepath)
        this.setState({ uploadBtnClass: 'button primary', files: [] })
      })
  }

  render () {
    const { files, uploadBtnClass } = this.state

    return (
      <div className='upload-box controls'>
        <input
          type='file'
          id='file'
          onChange={ ::this.handleFileInput }
          multiple={ false } />
        <label htmlFor='file' className='button primary'>
          { files.length > 0 ? files[0].name : 'Upload a file'}
          { files.length === 0 && <UploaderIcon /> }
        </label>
        { this.state.files.length !== 0 &&
          <button className={uploadBtnClass} onClick={::this.uploadFile}>
            <UploaderIcon />
          </button>
        }
      </div>
    )
  }
}

