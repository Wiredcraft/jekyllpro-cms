import GithubAPI from 'github-api';
import _ from 'lodash';
import _debug from 'debug';

const debug = _debug('jekyllpro-cms:repository:general');

/**
 * middleware
 * attach repo informatino to `req` - req.repo - { owner, name, fullName }
 * attach github-api instance to `req` - req.githubRepo
 */
const requireGithubAPI = (req, res, next) => {
  if (req.githubRepo) {
    return next();
  }
  const repoOwner = req.get('X-REPO-OWNER').toLowerCase();
  const repoName = req.get('X-REPO-NAME').toLowerCase();

  // attach repo info to request
  const repo = {
    owner: repoOwner,
    name: repoName,
    fullName: `${repoOwner}/${repoName}`
  };
  req.repo = repo;

  if (!repoName || !repoOwner) {
    res.status(401).send({ message: 'repository undefined' });
  }
  const token =
    req.get('X-TOKEN') || req.user.accessToken || req.user._json.accessToken;
  const github = new GithubAPI({ token });
  req.githubRepo = github.getRepo(repoOwner, repoName);
  next();
};

const getRepoDetails = (req, res, next) => {
  const repo = req.githubRepo;
  return repo
    .getDetails()
    .then(data => {
      // debug('getRepoDetails github getDetails data %o', data);
      const details = _.pick(data.data, [
        'name',
        'full_name',
        'description',
        'private',
        'url',
        'html_url',
        'default_branch',
        'created_at',
        'updated_at',
        'pushed_at',
        'permissions'
      ]);
      details.owner = _.pick(data.data.owner, ['login', 'avatar_url', 'type']);
      return res.status(200).json(details);
    })
    .catch(err => {
      debug('getRepoDetails error', err);
      return res.status(err.response.status).json(err.response.data);
    });
};

export default {
  requireGithubAPI,
  getRepoDetails
};
