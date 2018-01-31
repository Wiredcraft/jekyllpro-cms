'use strict'

const jsyaml = require('js-yaml')

const iso = require('./iso')

module.exports = (content) => {
  var config = jsyaml.safeLoad(content)
  var lanArray = config['lang']
  var otherConfig = config['jekyllpro_cms_config']
  let cmsConfig = null
  if (lanArray) {
    cmsConfig = {}
    cmsConfig['languages'] = lanArray.map(lanCode => {
      return {
        name: iso[lanCode] || lanCode,
        code: lanCode
      }
    })
  }

  if (otherConfig) {
    cmsConfig = cmsConfig
      ? Object.assign(cmsConfig, otherConfig)
      : Object.assign({}, otherConfig)
  }

  return cmsConfig
}
