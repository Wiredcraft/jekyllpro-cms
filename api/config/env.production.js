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
  github: {
    clientID: process.env.GITHUB_CLIENT_ID || '2d55b4e3be40483ac7bd',
    clientSecret: process.env.GITHUB_CLIENT_SECRETE || '93a8a77fef87f855fde202e1d72377b8792922f2',
    callbackURL: (process.env.SERVER_URL || 'http://localhost:3000') + '/api/auth/github/callback'
  },
  // redirectUrl should be the client service URL the github Oauth redirecting to
  redirectUrl: process.env.REDIRECT_URL || 'http://localhost:8000/',
  // the api service will be pointing to https://github.com/Wiredcraft/marketing if not specified
  repo: {
    user: process.env.REPO_ORG || 'wiredcraft',
    name: process.env.REPO_NAME || 'marketing'
  }
}
