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
    clientID: '425a3e66b53da5434284',
    clientSecret: '2c6516c0e1dad55ff8e1a7e6a2e2b0322400947d',
    callbackURL: 'http://localhost:3000/api/auth/github/callback'
  },
  redirectUrl: 'http://localhost:8000/',
  repo: {
    user: 'EcutDavid',
    name: 'test-gh-app'
  }
}
