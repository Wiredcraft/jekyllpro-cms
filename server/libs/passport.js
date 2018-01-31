'use strict'

const GithubStrategy = require('passport-github').Strategy

const config = require('../config')

// TODO: improvement, should save user.id
module.exports = (app, passport) => {
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
    new GithubStrategy(
      {
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackURL,
        passReqToCallback: true
      },
      function (req, accessToken, refreshToken, profile, cb) {
        // TODO: go find user
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
}
