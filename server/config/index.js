'use strict'

const developmentConfig = require('./development')
const productionConfig = require('./production')

const defaultConfig = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  secret: process.env.SESSION_SECRET || 'wiredcraft',

  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRETE,
    callbackURL: '/api/auth/github/callback'
  }
}

const config = {
  development: Object.assign({}, defaultConfig, developmentConfig),
  production: Object.assign({}, defaultConfig, productionConfig)
}

module.exports = config[process.env.NODE_ENV || 'development']
