'use strict'

/**
 *  Deduce collectionType from filename
 *  Note: only filename is used, so this is not that strict
 *
 * @param {array} schemaArray
 * @param {string} filepath - e.g. '_posts/en/web/2017-06-15-hello.md'
 * @return {string} - one of '', 'pages', ...
 */
module.exports = (schemaArray, filepath) => {
  let collectionType = ''
  if (/^[^_]+\w*\.html$/i.test(filepath)) {
    collectionType = 'pages'
  } else if (/\.(html|md|markdown)$/i.test(filepath)) {
    schemaArray.forEach(s => {
      if (filepath.indexOf(s.jekyll.dir) === 0) {
        collectionType = s.jekyll.id
      }
    })
  }
  return collectionType
}
