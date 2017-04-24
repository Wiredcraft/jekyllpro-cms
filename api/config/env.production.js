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
  // redirectUrl should be the client service URL the github Oauth redirecting to
  redirectUrl: process.env.REDIRECT_URL,
  serverUrl: process.env.SERVER_URL,
  cors: {
    origin: false
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRETE,
    callbackURL: process.env.REDIRECT_URL +'/api/auth/github/callback'
  }
}
