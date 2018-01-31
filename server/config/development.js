'use strcit'

const path = require('path')

module.exports = {
  dbHost: process.env.DB_HOST || 'localhost',
  db: process.env.DB || 'cms-dev',
  dbUsername: process.env.DB_USERNAME || '',
  dbPassword: process.env.DB_PASSWORD || '',

  redisDb: parseInt(process.env.REDIS_DB, 10) || 0,
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: parseInt(process.env.REDIS_PORT, 10) || 6379,

  clientPath: process.env.CLIENT_PATH || path.resolve(__dirname, '../../public/dev/index.html'),
  clientPathPublic: process.env.CLIENT_PATH || path.resolve(__dirname, '../../public/dev'),

  // redirectUrl should be the client service URL the github Oauth redirecting to
  redirectUrl: 'http://localhost:8000/',

  webhook: {
    name: 'web',
    active: true,
    config: {
      url: 'http://localhost:3000/api/webhook',
      content_type: 'json'
    }
  }
}
