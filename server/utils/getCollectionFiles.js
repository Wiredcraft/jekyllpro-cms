'use strict'

const { pick, forEach } = require('lodash')

module.exports = (schemaArray, filesArray) => {
  filesArray.forEach(item => {
    if (/^[^_]+\w*\.html$/i.test(item.path)) {
      // any html files that are not in folders starts with '_' are pages file
      item.collectionType = 'pages'
    } else if (
      item.type === 'blob' &&
      /\.(html|md|markdown)$/i.test(item.path) &&
      item.size < 3000000
    ) {
      // map collection type for files defined in schema
      forEach(schemaArray, s => {
        if (item.path.indexOf(s.jekyll.dir) === 0) {
          item.collectionType = s.jekyll.id
          return false
        }
      })
    }
  })
  return filesArray
    .filter(item => {
      return !!item.collectionType
    })
    .map(i => {
      return pick(i, ['path', 'collectionType'])
    })
}
