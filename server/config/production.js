'use strcit'

const path = require('path')

module.exports = {
  dbHost: process.env.DB_HOST || 'localhost',
  db: process.env.DB || 'cms-prod',
  dbUsername: process.env.DB_USERNAME || '',
  dbPassword: process.env.DB_PASSWORD || '',

  redisDb: parseInt(process.env.REDIS_DB, 10) || 0,
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: parseInt(process.env.REDIS_PORT, 10) || 6379,

  clientPath: process.env.CLIENT_PATH || path.resolve(__dirname, '../../public/dist/index.html'),
  clientPathPublic: process.env.CLIENT_PATH || path.resolve(__dirname, '../../public/dist'),

  // redirectUrl should be the client service URL the github Oauth redirecting to
  redirectUrl: process.env.REDIRECT_URL,
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRETE,
    callbackURL: process.env.REDIRECT_URL + '/api/auth/github/callback'
  },

  webhook: {
    name: 'web',
    active: true,
    config: {
      url: `${process.env.SERVER_URL}/api/webhook`,
      content_type: 'json'
    }
  }
}
