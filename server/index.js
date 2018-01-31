'use strict'

global.Promise = require('bluebird')

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const passport = require('passport')
const helmet = require('helmet')

const errorHandler = require('./middlewares/errorHandler')
const notFound = require('./middlewares/notFound')
const attachGithubAPI = require('./middlewares/attachGithubAPI')
const passportHandler = require('./libs/passport')
const routeHandler = require('./routes')
const config = require('./config')

const app = express()

// Setup security
app.use(helmet())
app.disable('x-powered-by')
// Body parser
app.use(bodyParser.json({ limit: '5mb' }))
app.use(bodyParser.urlencoded({ extended: true }))
// Static files
app.use('/public', express.static(path.join(__dirname, '../public')))
app.use('/app-public', express.static(config.clientPathPublic))
// app.use('/app-public', express.static(config.clientPathPublic))
// Views
app.set('views', './views')
app.set('view engine', 'pug')
// Session
app.use(session({
  name: 'sid',
  resave: true,
  secret: config.secret,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
  },
  store: new RedisStore({
    host: config.redisHost,
    port: config.redisPort,
    db: config.redisDb
  })
}))
// Initialize passport
app.use(passport.initialize())
app.use(passport.session())
passportHandler(app, passport)
// Attach Github api instance
app.use(attachGithubAPI(/^\/api\/repository\/.*$/))
// Routes
routeHandler(app, passport)
// Error handler
app.use(notFound())
app.use(errorHandler())

app.listen(config.port, () => {
  console.log(`Listening on ${config.port}`)
})

module.exports = app
