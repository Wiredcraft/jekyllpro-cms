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
  cors: {
    origin: 'http://localhost:8000',
    methods: 'POST,GET,OPTIONS',
    credentials: true
  },
  github: {
    clientID: '2d55b4e3be40483ac7bd',
    clientSecret: '93a8a77fef87f855fde202e1d72377b8792922f2',
    callbackURL: 'http://localhost:3000/api/auth/github/callback'
  },
  redirectUrl: 'http://localhost:8000/',
  repo: {
    user: 'EcutDavid',
    name: 'test-gh-app'
  }
}
