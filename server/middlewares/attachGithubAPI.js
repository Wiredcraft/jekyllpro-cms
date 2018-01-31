'use strcit'

const GithubAPI = require('github-api')

/**
 * attach repo informatino to `req` - req.repo - { owner, name, fullName }
 * attach github-api instance to `req` - req.githubRepo
 * @params
 *  - path | RegExp
*/
module.exports = (path) => (req, res, next) => {
  if ((path && !path.test(req.path)) || req.githubRepo) return next()

  const repoOwner = req.get('X-REPO-OWNER').toLowerCase()
  const repoName = req.get('X-REPO-NAME').toLowerCase()

  // attach repo info to request
  const repo = {
    owner: repoOwner,
    name: repoName,
    fullName: `${repoOwner}/${repoName}`
  }
  req.repo = repo

  if (!repoName || !repoOwner) {
    res.status(401).send({ message: 'repository undefined' })
  }
  const token =
    req.get('X-TOKEN') || req.user.accessToken || req.user._json.accessToken

  const github = new GithubAPI({ token })
  req.githubRepo = github.getRepo(repoOwner, repoName)

  next()
}
