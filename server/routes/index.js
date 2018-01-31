'use strict'

const config = require('../config')
const repository = require('./repository')
const user = require('./user')
const webhook = require('./webhook')

const ensureAuth = (ignorePaths = []) => {
  return (req, res, next) => {
    const isIgnoreReg = Object.prototype.toString.call(ignorePaths) === '[object RegExp]'
    if ((isIgnoreReg && ignorePaths.test(req.path)) || (ignorePaths.includes && ignorePaths.includes(req.path))) return next()
    if (!req.get('X-TOKEN') && !req.isAuthenticated()) {
      return res.status(401).send({ error: 'not authorized' })
    }
    next()
  }
}

module.exports = (app, passport) => {
  // API
  app.use('/api/repository', ensureAuth(), repository)
  app.use('/api/me', ensureAuth(['/']), user)
  app.use('/api/webhook', webhook)

  // SPA
  app.get('/', (req, res) => res.redirect('/app'))
  app.use('/app', (req, res) => { res.sendFile(config.clientPath) })

  // TODO: improvement
  // Auth
  app.get('/api/auth/github', passport.authenticate('github', { failureRedirect: '/app/login', scope: 'repo' }))
  // app.get('/api/auth/github', (req, res, next) => {
  //   // Set redirection path on session.
  //   // Do not redirect to a signin or signup page
  //   if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
  //     req.session.redirect_to = req.query.redirect_to
  //   }
  //   // Authenticate
  //   passport.authenticate('github', { scope: 'repo' })(req, res, next)
  // })
  app.get('/api/auth/github/callback', (req, res, next) => {
    let redirectUrl = config.redirectUrl
    // Pop redirect URL from session
    var sessionRedirectURL = req.session.redirect_to
    delete req.session.redirect_to

    // check if redirecUrl ends with "/"
    if (redirectUrl[redirectUrl.length - 1] === '/') {
      redirectUrl = redirectUrl.slice(0, -1)
    }

    var finalRedirectUrl = sessionRedirectURL
      ? redirectUrl + sessionRedirectURL
      : redirectUrl
    passport.authenticate('github', (err, user, info) => {
      if (err || !user) {
        return res.status(400).send(info)
      }
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err)
        }

        return res.redirect(finalRedirectUrl)
      })
    })(req, res, next)
  })
  app.get('/api/logout', (req, res) => {
    delete req.githubRepo
    req.logout()
    req.session.destroy()
    res.status(200).json({ status: 'ok' })
  })
}
