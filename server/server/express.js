import config from '../config'
import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import connectMongo from 'connect-mongo'
import methodOverride from 'method-override'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import cors from 'cors'
import { Strategy } from 'passport-github'
import helmet from 'helmet'
import lusca from 'lusca'
import users from './users'
import repository from './repository'
import { pushHook } from './webhook'

const MongoStore = connectMongo(session)

const initMiddleware = app => {
  // Request body parsing middleware should be above methodOverride
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: '5mb',
      parameterLimit: 5000
    })
  )
  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(methodOverride())

  app.use(cookieParser())

  app.use(cors(config.cors))
}

const initSession = (app, db) => {
  // Express MongoDB session storage
  app.use(
    session({
      saveUninitialized: true,
      resave: true,
      secret: config.sessionSecret,
      cookie: {
        maxAge: config.sessionCookie.maxAge,
        httpOnly: config.sessionCookie.httpOnly,
        secure: config.sessionCookie.secure && config.secure.ssl
      },
      name: config.sessionKey,
      store: new MongoStore({
        mongooseConnection: db.connection,
        collection: config.sessionCollection
      })
    })
  )

  // Lusca CSRF Middleware
  app.use(lusca(config.csrf))
}

const initPassport = app => {
  // Serialize sessions
  passport.serializeUser(function (user, done) {
    // user is the profile in github strategy
    done(null, user)
  })

  // Deserialize sessions
  passport.deserializeUser(function (user, done) {
    done(null, user)
  })

  passport.use(
    new Strategy(
      {
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackURL,
        passReqToCallback: true
      },
      function (req, accessToken, refreshToken, profile, cb) {
        // console.log('accessToken', accessToken)
        // console.log('refreshToken', refreshToken)
        // console.log('profile', profile)
        var providerData = profile._json
        providerData.accessToken = accessToken
        providerData.refreshToken = refreshToken

        cb(null, providerData)
      }
    )
  )
  // Add passport's middleware
  app.use(passport.initialize())
  app.use(passport.session())
}

const initHelmet = app => {
  // var SIX_MONTHS = 15778476000
  app.use(helmet.frameguard())
  app.use(helmet.xssFilter())
  app.use(helmet.noSniff())
  app.use(helmet.ieNoOpen())
  // only useful when suporting HTTPS, disable for now
  // app.use(helmet.hsts({
  //   maxAge: SIX_MONTHS,
  //   includeSubdomains: true,
  //   force: true
  // }))
  app.disable('x-powered-by')
}

const initRoutes = app => {
  // Setting the github oauth routes
  app.route('/api/auth/github').get(users.githubOauthCall())
  app
    .route('/api/auth/github/callback')
    .get(users.githubOauthCallback(config.redirectUrl))
  app.route('/api/logout').get(users.logout)
  app.route('/api/me').get(users.getUserInfo)
  app
    .route('/api/me/orgs')
    .all(users.requireAuthentication)
    .get(users.listUserOrgs)

  app
    .route('/api/me/repos')
    .all(users.requireAuthentication)
    .get(users.listUserRepos)

  app
    .route('/api/repository')
    .all(users.requireAuthentication, repository.requireGithubAPI)
    .get(repository.getRepoContent)
    .post(repository.writeRepoFile)
    .delete(repository.deleteRepoFile)

  app
    .route('/api/repository/index')
    .all(users.requireAuthentication, repository.requireGithubAPI)
    .get(repository.getRepoBranchIndex, repository.refreshIndexAndSave)

  app
    .route('/api/repository/updated-collections')
    .all(users.requireAuthentication, repository.requireGithubAPI)
    .get(repository.getRepoBranchUpdatedCollections)

  app
    .route('/api/repository/details')
    .all(users.requireAuthentication, repository.requireGithubAPI)
    .get(repository.getRepoDetails)

  app
    .route('/api/repository/branch')
    .all(users.requireAuthentication, repository.requireGithubAPI)
    .get(repository.listBranches)
    .post(repository.createBranches)

  app
    .route('/api/repository/schema')
    .all(users.requireAuthentication, repository.requireGithubAPI)
    .get(repository.getBranchSchema)

  app
    .route('/api/repository/tree')
    .all(users.requireAuthentication, repository.requireGithubAPI)
    .get(repository.listBranchTree)

  app
    .route('/api/repository/hooks')
    .all(users.requireAuthentication, repository.requireGithubAPI)
    .get(repository.listHooks)
    .post(repository.manageHook)

  app.route('/api/webhook').post(pushHook)
}

const initErrorHandler = app => {
  app.use(function (err, req, res, next) {
    if (!err) {
      return next()
    }

    console.error(err.stack)

    res.status(500).send(err)
  })
}

const init = db => {
  var app = express()
  app.set('views', './views')
  app.set('view engine', config.templateEngine || 'pug')

  initMiddleware(app)

  initHelmet(app)

  initSession(app, db)

  initPassport(app)

  initRoutes(app)
  initErrorHandler(app)

  return app
}

export default {
  initMiddleware,
  initSession,
  initPassport,
  initHelmet,
  initErrorHandler,
  init
}
