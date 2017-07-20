module.exports = {
  app: {
    title: 'JEKYLLPRO-CMS'
  },
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  templateEngine: 'pug',
  sessionCookie: {
    // session expiration is set by default to 7 days
    maxAge: 7 * 24 * (60 * 60 * 1000),
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: false
  },
  sessionSecret: process.env.SESSION_SECRET || 'WIREDCRAFT',
  // sessionKey is the cookie session name
  sessionKey: 'sessionId',
  sessionCollection: 'sessions',
  // Lusca config
  csrf: {
    csrf: false,
    csp: { policy: { 'default-src': '*' } },
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF',
    xssProtection: true
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRETE,
    callbackURL: '/api/auth/github/callback'
  }
};
