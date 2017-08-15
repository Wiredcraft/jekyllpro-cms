import _debug from 'debug';

const debug = _debug('jekyllpro-cms:repository:content');
const cb = (error, result, request) => {
  console.log(error);
  console.log(result);
};

const getRepoContent = (req, res, next) => {
  const repo = req.githubRepo;
  const { branch, path, raw } = req.query;

  return repo
    .getContents(branch, path, raw)
    .then(data => {
      return res.status(200).json(data.data);
    })
    .catch(err => {
      debug('getRepoContent error', err);
      return res
        .status(err.status || err.response.status)
        .json(err.response.data);
    });
};

const writeRepoFile = (req, res, next) => {
  var repo = req.githubRepo;
  var newFile = req.body;
  if (!newFile.options) {
    newFile.options = { encode: true };
  }
  return repo
    .writeFile(
      newFile.branch,
      newFile.path,
      newFile.content,
      newFile.message,
      newFile.options,
      cb
    )
    .then(data => {
      return res.status(200).json(data.data);
    })
    .catch(err => {
      debug('writeRepoFile error: ', err);
      return res
        .status(err.status || err.response.status)
        .json(err.response.data);
    });
};

const deleteRepoFile = (req, res, next) => {
  var repo = req.githubRepo;
  var toBeDeleted = req.body;

  return repo
    .deleteFile(toBeDeleted.branch, toBeDeleted.path, cb)
    .then(data => {
      return res.status(200).json(data.data);
    })
    .catch(err => {
      debug('deleteRepoFile error: ', err);
      return res
        .status(err.status || err.response.status)
        .json(err.response.data);
    });
};

export default {
  getRepoContent,
  writeRepoFile,
  deleteRepoFile
};
