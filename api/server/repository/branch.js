import _debug from 'debug';

const debug = _debug('jekyllpro-cms:repository:branch');

const listBranches = (req, res, next) => {
  var repo = req.githubRepo;
  var { branch } = req.query;

  var nextPromise = branch ? repo.getBranch(branch) : repo.listBranches();

  return nextPromise
    .then(data => {
      return res.status(200).json(data.data);
    })
    .catch(err => {
      debug('listBranches error: ', err);
      return res
        .status(err.status || err.response.status || err.response.status)
        .json(err.response.data);
    });
};

const createBranches = (req, res, next) => {
  const repo = req.githubRepo;
  const formData = req.body;

  return repo
    .createBranch(formData.oldBranch, formData.newBranch)
    .then(data => {
      return res.status(200).json(data.data);
    })
    .catch(err => {
      debug('createBranches error: ', err);
      return res
        .status(err.status || err.response.status)
        .json(err.response.data);
    });
};

const getBranchSchema = (req, res, next) => {
  var repo = req.githubRepo;
  var { ref, path } = req.query;
  path = path || '_schema';

  repo
    .getContents(ref, path)
    .then(data => {
      let schemaFiles = data.data
        .filter(item => {
          // filter out folder files
          return item.type === 'file';
        })
        .map(item => {
          return repo.getContents(ref, item.path, true).then(data => {
            return { name: item.name, data: data.data };
          });
        });

      return Promise.all(schemaFiles).then(results => {
        res.status(200).json(results);
      });
    })
    .catch(err => {
      console.log(err);
      res.status(err.status || err.response.status).json(err.response.data);
    });
};

const listBranchTree = (req, res) => {
  var repo = req.githubRepo;
  var branch = req.query.branch || 'master';
  repo
    .getTree(`${branch}?recursive=1`)
    .then(data => {
      return res.status(200).json(data.data);
    })
    .catch(err => {
      console.log(err);
      return res
        .status(err.status || err.response.status)
        .json(err.response.data);
    });
};

export default {
  listBranches,
  createBranches,
  getBranchSchema,
  listBranchTree
};
