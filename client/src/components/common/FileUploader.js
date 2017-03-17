import React, { Component } from 'react'

import UploaderIcon from '../svg/UploaderIcon'

export default class FileUploader extends Component {
  constructor(props) {
    super(props)
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
    const { uploadFolder } = this.props
    this.setState({
      uploadPath: uploadFolder === '/' ? ('/' + files[0].name) : (uploadFolder + '/' + files[0].name),
      files: files
     })
  }

  uploadFile () {
    const { addNewFile, fileAdded, currentBranch } = this.props
    let { files, uploadPath } = this.state

    //normalize path
    let p = uploadPath.split('/')
    p = p.filter(s => {
      return s !== ''
    })
    uploadPath = p.join('/')

    // console.log(uploadPath)
    this.setState({ uploadBtnClass: 'button primary disabled processing'})
    addNewFile(currentBranch, uploadPath, files[0].base64, { encode: false })
      .then(() => {
        fileAdded(uploadPath)
        this.setState({ uploadBtnClass: 'button primary', files: [] })
      })
  }

  handlePathInput(evt) {
    this.setState({ uploadPath: evt.target.value })
  }

  render () {
    const { uploadFolder } = this.props
    const { files, uploadBtnClass, uploadPath } = this.state

    return (
      <div className={files.length > 0 ? 'upload-box confirm' : 'upload-box controls'}>
        <div className={files.length > 0 ? 'field confirm-filename' : ''}>
          { files.length > 0 && <label>File</label> }

          <input
            type='file'
            id='file'
            onChange={ ::this.handleFileInput }
            multiple={ false } />
          <label htmlFor='file' className='button primary'>
            { files.length > 0 ? files[0].name : 'Upload a file'}
            { files.length === 0 && <UploaderIcon /> }
          </label>
        </div>
        {
          files.length > 0 &&
          <div className='field confirm-destination'>
            <label>Destination</label>
            <input type='text'
              value={uploadPath}
              onChange={::this.handlePathInput} />
          </div>
        }
        { this.state.files.length !== 0 &&
          <button className={uploadBtnClass} onClick={::this.uploadFile}>
            Confirm upload
          </button>
        }
      </div>
    )
  }
}

