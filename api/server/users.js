import passport from 'passport'
import GithubAPI from 'github-api'

var noReturnUrls = [
  '/login'
]

/**
 * OAuth provider call
 */
const githubOauthCall = function () {
  return function (req, res, next) {
    // Set redirection path on session.
    // Do not redirect to a signin or signup page
    if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
      req.session.redirect_to = req.query.redirect_to
    }
    // Authenticate
    passport.authenticate('github', {scope: 'repo'})(req, res, next)
  }
}

/**
 * OAuth callback
 */
const githubOauthCallback = function (redirectUrl) {
  return function (req, res, next) {
    // Pop redirect URL from session
    var sessionRedirectURL = req.session.redirect_to
    delete req.session.redirect_to

    passport.authenticate('github', (err, user, info) => {
      if (err || !user) {
        console.log(err)
        return res.status(400).send(info)
      }
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err)
        }
        // redirectUrl = (redirectUrl || '/') + '?code=' + user.accessToken
        return res.redirect(redirectUrl || sessionRedirectURL || '/')
      })
    })(req, res, next)
  }
}

const requireAuthentication = (req, res, next) => {
  if (!req.get('X-TOKEN') && (!req.isAuthenticated || !req.isAuthenticated())) {
    return res.status(401).send({error: 'not authorized'})
  }
  next()
}

const getUserInfo = (req, res) => {
  if (req.user) {
    var info = Object.assign({}, req.user)
    delete info.accessToken
    delete info.refreshToken
    res.status(200).send(info)
  } else if (req.get('X-TOKEN')) {
    var gh = new GithubAPI({ token: req.get('X-TOKEN') })
    gh.getUser().getProfile()
      .then((data) => {
        // console.log(data)
        res.status(200).json(data.data)
      })
      .catch((err) => {
        // console.log(err)
        if (err.status === 404) {
          return res.status(404).json(err.response.data)
        }
        res.status(401).send({error: 'not authorized'})
      })
  } else {
    res.status(401).send({error: 'not authorized'})
  }
}

const logout = (req, res) => {
  delete req.githubRepo
  req.logout()
  res.status(200).json({status: 'ok'})
}

export default {
  githubOauthCall,
  githubOauthCallback,
  requireAuthentication,
  getUserInfo,
  logout
}
