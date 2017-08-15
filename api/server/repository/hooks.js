import { hookConfig } from '../webhook';

const listJekyllplusHook = (repoObject, hookUrl) => {
  return repoObject.listHooks().then(list => {
    if (!hookUrl) {
      return list.data;
    }
    let arr = list.data.filter(hook => {
      return hook.config.url === hookUrl;
    });
    if (arr.length > 0) {
      return arr[0];
    }
    return null;
  });
};

const listHooks = (req, res) => {
  var repo = req.githubRepo;
  repo
    .listHooks()
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

const manageHook = (req, res) => {
  var repo = req.githubRepo;
  var mergedConfig = Object.assign({}, hookConfig, req.body.config || {});
  if (req.body.action === 'create') {
    listJekyllplusHook(repo, mergedConfig.config.url)
      .then(hook => {
        if (hook) {
          return res.status(200).json(hook);
        }
        return repo.createHook(mergedConfig);
      })
      .then(data => {
        return res.status(200).json(data.data);
      })
      .catch(err => {
        console.log(err);
        return res
          .status(err.status || err.response.status)
          .json(err.response.data);
      });
  }
  if (req.body.action === 'delete') {
    listJekyllplusHook(repo, mergedConfig.config.url)
      .then(hook => {
        if (hook) {
          return repo.deleteHook(hook.id).then(data => {
            return res.status(200).json(data.data);
          });
        }
        return res.status(204).send('no content');
      })
      .catch(err => {
        console.log(err);
        return res
          .status(err.status || err.response.status)
          .json(err.response.data);
      });
  }
};

export default {
  listHooks,
  manageHook
};
