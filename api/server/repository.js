import GithubAPI from 'github-api';
import _ from 'lodash';
import Bluebird from 'bluebird';
import mongoose from 'mongoose';
import _debug from 'debug';

const ObjectId = mongoose.Types.ObjectId;
const debug = _debug('jekyllpro-cms:repository');
mongoose.Promise = Bluebird;
const RepoFileEntry = mongoose.model('RepoFileEntry');
const lodash = _; // TODO

import {
  TaskQueue,
  getCollectionFiles,
  getCollectionType,
  getLangFromConfigYaml
} from './utils';
import { RepoIndex, RepoAccessToken } from './database';
import { hookConfig } from './webhook';

const RUNNING_JOBS = {};

const cb = (error, result, request) => {
  console.log(error);
  console.log(result);
};

/**
 * middleware
 * attach github-api instance to `req` - req.githubRepo
 */
const requireGithubAPI = (req, res, next) => {
  if (req.githubRepo) {
    return next();
  }
  var repoOwner = req.get('X-REPO-OWNER');
  var repoName = req.get('X-REPO-NAME');
  if (!repoName || !repoOwner) {
    res.status(401).send({ message: 'repository undefined' });
  }
  var ak =
    req.get('X-TOKEN') || req.user.accessToken || req.user._json.accessToken;
  var github = new GithubAPI({
    token: ak
  });
  req.githubRepo = github.getRepo(repoOwner, repoName);
  next();
};

const getRepoDetails = (req, res, next) => {
  var repo = req.githubRepo;

  repo
    .getDetails()
    .then(data => {
      // console.log(data)
      var details = _.pick(data.data, [
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
      res.status(200).json(details);
    })
    .catch(err => {
      // console.log(err)
      res.status(err.response.status).json(err.response.data);
    });
};

const getRepoContent = (req, res, next) => {
  var repo = req.githubRepo;
  var { branch, path, raw } = req.query;

  repo
    .getContents(branch, path, raw)
    .then(data => {
      // console.log(data)
      res.status(200).json(data.data);
    })
    .catch(err => {
      // console.log(err)
      res.status(err.status || err.response.status).json(err.response.data);
    });
};

const writeRepoFile = (req, res, next) => {
  var repo = req.githubRepo;
  var newFile = req.body;
  if (!newFile.options) {
    newFile.options = { encode: true };
  }
  repo
    .writeFile(
      newFile.branch,
      newFile.path,
      newFile.content,
      newFile.message,
      newFile.options,
      cb
    )
    .then(data => {
      // console.log(data)
      res.status(200).json(data.data);
    })
    .catch(err => {
      // console.log(err)
      res.status(err.status || err.response.status).json(err.response.data);
    });
};

const deleteRepoFile = (req, res, next) => {
  var repo = req.githubRepo;
  var toBeDeleted = req.body;

  repo
    .deleteFile(toBeDeleted.branch, toBeDeleted.path, cb)
    .then(data => {
      // console.log(data)
      res.status(200).json(data.data);
    })
    .catch(err => {
      // console.log(err)
      res.status(err.status || err.response.status).json(err.response.data);
    });
};

const listBranches = (req, res, next) => {
  var repo = req.githubRepo;
  var { branch } = req.query;

  var nextPromise = branch ? repo.getBranch(branch) : repo.listBranches();

  return nextPromise
    .then(data => {
      // console.log(data)
      res.status(200).json(data.data);
    })
    .catch(err => {
      // console.log(err)
      res
        .status(err.status || err.response.status || err.response.status)
        .json(err.response.data);
    });
};

const createBranches = (req, res, next) => {
  var repo = req.githubRepo;
  var formData = req.body;

  repo
    .createBranch(formData.oldBranch, formData.newBranch)
    .then(data => {
      // console.log(data)
      res.status(200).json(data.data);
    })
    .catch(err => {
      // console.log(err)
      res.status(err.status || err.response.status).json(err.response.data);
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

const getRepoBranchIndex = (req, res, next) => {
  var repo = req.githubRepo;
  var branch = req.query.branch || 'master';
  var refreshIndex = req.query.refresh === true || req.query.refresh === 'true';
  // TODO for test force this to false
  refreshIndex = false;
  var repoFullname = req.get('X-REPO-OWNER') + '/' + req.get('X-REPO-NAME');

  // update access token in db, which can be used to run the webhook service
  RepoAccessToken.findOneAndUpdate(
    {
      repository: repoFullname
    },
    {
      repository: repoFullname,
      accessToken: req.user.accessToken,
      updatedBy: req.user.login,
      updated: Date()
    },
    {
      upsert: true
    },
    err => {
      if (err) console.log(err);
    }
  );

  if (refreshIndex) {
    // set flag to clean old db record later if a new index cannot be built
    req.purgeDb = true;
    return next();
  }

  RepoIndex.findByRepoInfo(repoFullname, branch, (err, record) => {
    if (err) {
      console.log(err);
      return next();
    }
    if (!record) {
      return next();
    }
    debug(
      'get database record:',
      record.repository,
      record.branch,
      record.updated,
      record.tipCommitSha
    );
    // some repo branches might have legacy index data built when it didn't have schemas.
    // only return record if it has schemas.

    // collections now should be an array though unpopulated
    if (Array.isArray(record.collections) && record.tipCommitSha) {
      record
        .populate({
          path: 'collections',
          options: {
            sort: {
              lastUpdatedAt: 'desc'
            }
          }
        })
        .execPopulate()
        .then(record => {
          // @see mongoose doc
          // http://mongoosejs.com/docs/api.html#document_Document-execPopulate
          debug('record id is %s', record._id);
          let data = {
            updated: record.updated,
            collections: record.collections,
            schemas: JSON.parse(record.schemas),
            config: JSON.parse(record.config)
          };
          return res.status(200).json(data);
        });
    } else {
      debug('record invalid');
      // set flag to clean old db record later if a new index cannot be built
      req.purgeDb = true;
      // next middleware should be refreshIndexAndSave()
      return next();
    }
  });
};

function getRepoBranchUpdatedCollections(req, res) {
  const repo = req.githubRepo;
  const branch = req.query.branch || 'master';
  const repoFullname = req.get('X-REPO-OWNER') + '/' + req.get('X-REPO-NAME');
  // TODO
  // currently refreshIndexIncremental will always resolve
  // but we need to figure
  return refreshIndexIncremental({
    github: repo,
    repoFullname,
    branch
  })
    .then(collections => res.status(200).json({ collections }))
    .catch(
      err =>
        console.log(err) ||
        res.status(err.status || err.response.status).json(err.response.data)
    );
}

/**
 * @return {Promise<collections>} - collections: { modified: Array, removed: Array }
 */
function refreshIndexIncremental({ github, repoFullname, branch }) {
  debug(`refreshIndexIncremental ${repoFullname}:${branch}`);
  let repoIndex = null;
  let schemaArray = null;
  let tipCommitSha = null;
  const collections = {
    modified: [], // consider added as modified
    removed: []
  };

  // throttle
  const jobKey = `refreshIndexIncremental:${repoFullname}:${branch}`;
  if (RUNNING_JOBS[jobKey]) {
    debug('another refreshIndexIncremental task is running, returning');
    return Promise.resolve(collections);
  }
  RUNNING_JOBS[jobKey] = true;
  const dispose = () => {
    delete RUNNING_JOBS[jobKey];
  };

  // get last commit
  return Promise.all([
    RepoIndex.findOne({ repository: repoFullname, branch }),
    github.getRef(`heads/${branch}`)
  ])
    .then(([_repoIndex, refData]) => {
      if (!_repoIndex.tipCommitSha) {
        debug(
          'Error: no tipCommitSha on %s repoIndex %s',
          repoFullname,
          _repoIndex._id
        );
        throw 'break';
      }

      tipCommitSha = lodash.get(refData, 'data.object.sha');
      // can not get the commit sha
      if (typeof tipCommitSha !== 'string') throw 'break';
      // the commit sha is same as the one in database
      if (tipCommitSha === _repoIndex.tipCommitSha) throw 'break';

      debug(
        `tip commit: db is ${_repoIndex.tipCommitSha} remote is ${tipCommitSha}`
      );
      repoIndex = _repoIndex;
      schemaArray = JSON.parse(repoIndex.schemas);

      // doc https://developer.github.com/v3/repos/commits/#compare-two-commits
      return github.compareBranches(repoIndex.tipCommitSha, branch);
    })
    .then(data => {
      debug(
        '%d commits between %s and %s',
        data.data.total_commits,
        repoIndex.tipCommitSha,
        branch
      );
      // debug('files %j', data.data.files);
      return Bluebird.map(
        data.data.files,
        f => {
          const { filename } = f;
          // TODO we should saparate logic out
          // and take excludes in _config.yml into account
          const files = data.data.files.filter(f =>
            /\.(html|md|markdown)$/i.test(filename)
          );
          const collectionType = getCollectionType(schemaArray, filename);

          if (collectionType === '') {
            return Bluebird.resolve();
          }

          if (f.status === 'removed') {
            return removeEntryOfRepo({
              filename: filename,
              repoIndex
            }).then(removed => {
              if (!removed) return;
              collections.removed.push(removed);
            });
          } else {
            // consider added as modified
            return upsertEntryOfRepo({
              github,
              branch,
              collectionType,
              filename: filename,
              repoIndex
            }).then(modified => {
              if (!modified) return;
              collections.modified.push(modified);
            });
          }
        },
        {
          concurrency: 5
        }
      );
    })
    .then(() => {
      // update the tipCommitSha
      repoIndex.tipCommitSha = tipCommitSha;
      return repoIndex.save();
    })
    .then(() => {
      dispose();
      return collections;
    })
    .catch(err => {
      if (err !== 'break') throw err;

      dispose();
      return collections;
    });
}

/**
 * delete the entry instance and remove it from the repo
 *
 * @param {string} filename
 * @param {object} repoIndex - mongoose RepoIndex doc instance
 * @return {Promise} - resolve to undefined or { _id: string, path: string }
 */
function removeEntryOfRepo({ filename, repoIndex }) {
  return RepoFileEntry.findOne({
    path: filename,
    repoBranch: repoIndex
  }).then(entryInst => {
    if (!entryInst) return;

    repoIndex.collections.remove(entryInst._id);
    const removed = {
      _id: entryInst._id,
      path: entryInst.path
    };
    return repoIndex
      .save()
      .then(() => RepoFileEntry.find({ _id: entryInst._id }).remove().exec())
      .then(() => removed);
  });
}

/**
 * update or add a entry to a repo
 * will call github api to fetch file content and commit history
 *
 * @param {object} github - github-api instance
 * @param {string} branch
 * @param {string} collectionType - e.g. `post`
 * @param {string} filename
 * @param {object} repoIndex - mongoose RepoIndex doc instance
 * @return {Promise} - resolve to undefined or a entry
 */
function upsertEntryOfRepo({
  github,
  branch,
  collectionType,
  filename,
  repoIndex
}) {
  return Promise.all([
    github.getContents(branch, filename, true),
    github.listCommits({ sha: branch, path: filename })
  ]).then(([data, commits]) => {
    const content = data.data;
    const lastCommit = commits.data[0];

    const cond = {
      path: filename,
      repoBranch: repoIndex
    };
    const entry = {
      collectionType,
      content,
      lastCommitSha: lastCommit.sha,
      lastUpdatedAt: lastCommit.commit.committer.date,
      lastUpdatedBy: lastCommit.commit.committer.name,
      path: filename,
      repoBranch: repoIndex
    };
    const opt = { upsert: true, new: true };
    return RepoFileEntry.findOneAndUpdate(cond, entry, opt).then(entryInst => {
      if (!entryInst) {
        debug('faild to upsert file entry: %o', cond);
        // TODO better throw here
        return Promise.reject({
          status: 500,
          response: {
            data: {
              message: 'unable to create file entry instance in database'
              // TODO errorCode
            }
          }
        });
      }

      repoIndex.collections.addToSet(entryInst);
      const modified = lodash.pick(entry, [
        'collectionType',
        'content',
        'lastCommitSha',
        'lastUpdatedAt',
        'lastUpdatedBy',
        'path'
      ]);

      return repoIndex.save().then(() => modified);
    });
  });
}

const refreshIndexAndSave = (req, res) => {
  var repo = req.githubRepo;
  var branch = req.query.branch || 'master';
  var repoFullname = req.get('X-REPO-OWNER') + '/' + req.get('X-REPO-NAME');
  debug(`refreshIndexAndSave - ${repoFullname}`);
  var jobKey = repoFullname + '_' + branch;

  // avoid doing multiple refresh to same repo branch at same time
  if (RUNNING_JOBS[jobKey]) {
    return res
      .status(409)
      .json({ message: 'is building index for ' + jobKey, errorCode: 4091 });
  }

  RUNNING_JOBS[jobKey] = true;

  return getFreshIndexFromGithub({
    repoObject: repo,
    repoFullname,
    branch
  })
    .then(formatedIndex => {
      // update database
      const startTime = new Date();
      debug(`create repo index - ${repoFullname}`);
      return RepoIndex.findOneAndUpdate(
        {
          repository: repoFullname,
          branch: branch
        },
        {
          repository: repoFullname,
          branch: branch,
          // collections: JSON.stringify(formatedIndex.collections),
          schemas: JSON.stringify(formatedIndex.schemas),
          config: JSON.stringify(formatedIndex.config),
          updated: Date()
        },
        {
          upsert: true,
          new: true
        }
      )
        .then(repoIndex => {
          const collections = repoIndex.collections;
          if (Array.isArray(collections) && repoIndex.tipCommitSha) {
            // delete all collections
            return deleteAllEntries(collections).then(() => repoIndex);
          }
          return repoIndex;
        })
        .then(repoIndex => {
          debug('get repoIndex: %j', {
            _id: repoIndex._id,
            __v: repoIndex.__v,
            updated: repoIndex.updated,
            updatedBy: repoIndex.updatedBy
          });
          // TODO separate this into a method/func
          return Bluebird.map(
            formatedIndex.collections,
            item => {
              const entry = new RepoFileEntry({
                collectionType: item.collectionType,
                content: item.content,
                lastCommitSha: item.lastCommitSha,
                lastUpdatedAt: item.lastUpdatedAt,
                lastUpdatedBy: item.lastUpdatedBy,
                path: item.path,
                repoBranch: repoIndex
              });
              return entry.save().then(() => repoIndex.collections.push(entry));
            },
            {
              concurrency: 5
            }
          ).then(() => {
            debug(
              `it takes ${new Date() - startTime}ms to build the complete index`
            );
            return repoIndex.save();
          });
        })
        .catch(err => console.log(err));

      delete RUNNING_JOBS[jobKey];

      formatedIndex.updated = new Date();
      return res.status(200).json(formatedIndex);
    })
    .catch(err => {
      console.log(err);
      delete RUNNING_JOBS[jobKey];

      // remove obsolete index data
      if (err.status === 404 && req.purgeDb) {
        deleteARepoIndex({ repository: repoFullname, branch }).catch(err =>
          debug('db error', err)
        );
      }
      return res
        .status(err.status || err.response.status)
        .json(err.response.data);
    });
};

function deleteARepoIndex({ repository, branch }) {
  return RepoIndex.findOne({ repository, branch }).then(repoIndex => {
    if (!repoIndex) return;
    const collections = repoIndex.collections;
    if (Array.isArray(collections) && repoIndex.tipCommitSha) {
      // delete all collections
      return deleteAllEntries(collections).then(() => repoIndex.remove());
    }
    return repoIndex.remove();
  });
}

function deleteAllEntries(entries) {
  return Bluebird.map(
    entries,
    item => {
      return RepoFileEntry.findByIdAndRemove(item).exec();
    },
    {
      concurrency: 5
    }
  );
}

/**
 * @param {string} repoFullname - e.g. `wiredcraft/pipelines`
 */
const getFreshIndexFromGithub = ({ repoObject, repoFullname, branch }) => {
  debug('enter func getFreshIndexFromGithub');
  return repoObject
    .getTree(`${branch}?recursive=1`)
    .then(data => {
      debug(`clean up existing repo index - ${repoFullname}`);
      return deleteARepoIndex({
        repository: repoFullname,
        branch: branch
      })
        .then(() => {
          // update tipCommitSha
          debug('update tipCommitSha to %s', data.data.sha);
          return RepoIndex.findOneAndUpdate(
            {
              repository: repoFullname,
              branch: branch
            },
            {
              repository: repoFullname,
              branch: branch,
              tipCommitSha: data.data.sha,
              updated: Date()
            },
            {
              upsert: true,
              new: true
            }
          );
        })
        .then(() => data);
    })
    .then(data => {
      var treeArray = data.data.tree;
      var requestQueue = new TaskQueue(3);
      var formatedIndex = { collections: [] };
      var jekyllProConfigReq = Promise.resolve();

      const isJekyllRepo = treeArray.some(
        entry => entry.path === '_config.yml'
      );

      if (isJekyllRepo) {
        jekyllProConfigReq = repoObject
          .getContents(branch, '_config.yml', true)
          .then(data => {
            formatedIndex['config'] = getLangFromConfigYaml(data.data);
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        jekyllProConfigReq = Promise.reject({
          status: 404,
          response: {
            data: { message: 'Not a valid jekyll repository', errorCode: 4041 }
          }
        });
      }

      const schemaFiles = treeArray.filter(
        i => i.type === 'blob' && i.path.indexOf('_schemas/') === 0
      );
      const schemaFilesReqPromises = schemaFiles.map(f => {
        return repoObject
          .getContents(branch, f.path, true)
          .then(data => data.data)
          .catch(err => console.log(err));
      });

      const nextPromiseFlow = Promise.all(
        schemaFilesReqPromises
      ).then(schemas => {
        // if no schemas at all, end the request flow here
        if (!schemas || !schemas.length) {
          return Promise.reject({
            status: 404,
            response: {
              data: {
                message: 'no schemas of this repository branch!',
                errorCode: 4042
              }
            }
          });
        }

        formatedIndex.schemas = schemas;
        const collectionFiles = getCollectionFiles(schemas, treeArray);
        debug(
          'got %d entries from GitHub, showing the 1st one %o',
          collectionFiles.length,
          collectionFiles[0]
        );
        return new Promise((resolve, reject) => {
          collectionFiles.forEach((item, idx) => {
            requestQueue.pushTask(() => {
              let getContentReq = repoObject
                .getContents(branch, item.path, true)
                .then(content => {
                  item.content = content.data;
                  return 'ok';
                });
              let getCommitsReq = repoObject
                .listCommits({ sha: branch, path: item.path })
                .then(commits => {
                  var lastCommit = commits.data[0];
                  item.lastCommitSha = lastCommit.sha;
                  item.lastUpdatedAt = lastCommit.commit.committer.date;
                  item.lastUpdatedBy = lastCommit.commit.committer.name;
                  return 'ok';
                });

              return Promise.all([getContentReq, getCommitsReq])
                .then(results => {
                  formatedIndex.collections.push(item);
                  if (idx === collectionFiles.length - 1) {
                    return resolve(formatedIndex);
                  }
                })
                .catch(err => {
                  console.log(err);
                  formatedIndex.collections.push(item);
                  if (idx === collectionFiles.length - 1) {
                    return resolve(formatedIndex);
                  }
                });
            });
          });
        });
      });

      return jekyllProConfigReq.then(() => nextPromiseFlow);
    });
};

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
  requireGithubAPI,
  getRepoDetails,
  getRepoContent,
  listBranches,
  createBranches,
  getBranchSchema,
  writeRepoFile,
  deleteRepoFile,
  getRepoBranchIndex,
  getRepoBranchUpdatedCollections,
  refreshIndexAndSave,
  getFreshIndexFromGithub,
  listBranchTree,
  listHooks,
  manageHook
};
