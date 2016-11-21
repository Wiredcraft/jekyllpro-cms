import React, { Component } from 'react'

export default class FileUploader extends Component {
  constructor() {
    super()
    this.state = {
      files: [],
      uploadFolder: ''
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

  handleFolderInput(evt) {
    this.setState({ uploadFolder: evt.target.value })
  }

  onDone (files) {
    this.setState({ files: files })
    console.log(files)
  }

  uploadFile () {
    const { addNewFile, fileAdded, toRoute, currentBranch } = this.props
    let { files, uploadFolder } = this.state
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
    addNewFile(currentBranch, filepath, files[0].base64, { encode: false })
      .then(() => {
        fileAdded(filepath)
        toRoute(`/files/${currentBranch}/`)
      })
  }

  render () {
    const { altFilename, uploadFolder, files } = this.state
    return (
      <section id='content'>
        <div className='upload-box'>
          <input
            type='file'
            id='file'
            onChange={ ::this.handleFileInput }
            multiple={ false } />
          <label htmlFor='file'>{ files.length > 0 ? files[0].name : 'Choose File'}</label>
          <div className='field filename'>
            <input
              className=''
              type='text'
              ref="filePath"
              value={uploadFolder}
              onChange={::this.handleFolderInput}
              placeholder='Folder path: i.e. "assets/"' />
          </div>
          { this.state.files.length !== 0 &&
            <button className='button primary' onClick={::this.uploadFile}>Upload</button>
          }
        </div>
      </section>
    )
  }
}