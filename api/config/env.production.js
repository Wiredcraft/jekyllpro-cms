module.exports = {
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/cms-dev',
    options: {
      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  corsEnabled: true,
  github: {
    clientID: process.env.GITHUB_CLIENT_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_CLIENT_SECRETE || 'APP_SECRETE',
    callbackURL: 'http://localhost:3000/api/auth/github/callback'
  },
  repo: {
    user: '',
    name: ''
  }
}