const path = require('path');

module.exports = {
  db: {
    uri:
      process.env.MONGOHQ_URL ||
      process.env.MONGODB_URI ||
      `mongodb://${process.env.DB_HOST}/${process.env.DB}`,
    options: {
      user: process.env.DB_USERNAME,
      pass: process.env.DB_PASSWORD
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  // redirectUrl should be the client service URL the github Oauth redirecting to
  redirectUrl: process.env.SERVER_URL + '/',
  serverUrl: process.env.SERVER_URL,
  cors: {
    origin: false
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.SERVER_URL + '/api/auth/github/callback'
  },

  clientPath: process.env.CLIENT_PATH || path.resolve(__dirname, '../../public/dist/index.html'),
  clientPathPublic: process.env.CLIENT_PATH || path.resolve(__dirname, '../../public/dist'),
};
