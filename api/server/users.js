import passport from 'passport'

var noReturnUrls = [
  '/login'
];

/**
 * OAuth provider call
 */
const githubOauthCall = function () {
  return function (req, res, next) {
    // Set redirection path on session.
    // Do not redirect to a signin or signup page
    if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
      req.session.redirect_to = req.query.redirect_to;
    }
    // Authenticate
    passport.authenticate('github', {scope: 'repo'})(req, res, next);
  };
};

/**
 * OAuth callback
 */
const githubOauthCallback = function () {
  return function (req, res, next) {
    // Pop redirect URL from session
    var sessionRedirectURL = req.session.redirect_to;
    delete req.session.redirect_to;

    passport.authenticate('github', (err, user, info) => {
      if (err || !user) {
        console.log(err)
        return res.status(400).send(info)
      }
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err)
        }
        return res.redirect('/')
        // return res.redirect(info || sessionRedirectURL || '/');
      });

    })(req, res, next);
  };
};

const requireAuthentication = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).send({error: 'not authorized'});
  }
  next();
} 

const logout = (req, res) => {
  delete req.githubRepo
  req.logout();
  res.status(200).json({status: 'ok'})
}

export default {
  githubOauthCall,
  githubOauthCallback,
  requireAuthentication,
  logout
}