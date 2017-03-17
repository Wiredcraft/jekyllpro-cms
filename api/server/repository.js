import GithubAPI from 'github-api'
import _ from 'lodash'

import { TaskQueue, getCollectionFiles, getLangFromConfigYaml } from './utils'
import { RepoIndex, RepoAccessToken } from './database'
import { hookConfig } from './webhook'

const RUNNING_JOBS = {}

const cb = (error, result, request) => {
  console.log(error)
  console.log(result)
}

const requireGithubAPI = (req, res, next) => {
  if (req.githubRepo) {
    return next()
  }
  var repoOwner = req.get('X-REPO-OWNER')
  var repoName = req.get('X-REPO-NAME')
  if (!repoName || !repoOwner) {
    res.status(401).send({message: 'repository undefined'})
  }
  var ak = req.get('X-TOKEN') || req.user.accessToken || req.user._json.accessToken
  var github = new GithubAPI({
    token: ak
  })
  req.githubRepo = github.getRepo(repoOwner, repoName)
  next()
}

const getRepoDetails = (req, res, next) => {
  var repo = req.githubRepo

  repo.getDetails()
  .then((data) => {
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
    ])
    details.owner = _.pick(data.data.owner, [
      'login',
      'avatar_url',
      'type'
    ])
    res.status(200).json(details)
  })
  .catch((err) => {
    // console.log(err)
    res.status(err.response.status).json(err.response.data)
  })
}

const getRepoContent = (req, res, next) => {
  var repo = req.githubRepo
  var { branch, path, raw } = req.query

  repo.getContents(branch, path, raw)
  .then((data) => {
    // console.log(data)
    res.status(200).json(data.data)
  })
  .catch((err) => {
    // console.log(err)
    res.status(err.status || err.response.status).json(err.response.data)
  })
}

const writeRepoFile = (req, res, next) => {
  var repo = req.githubRepo
  var newFile = req.body
  if (!newFile.options) {
    newFile.options = {encode: true}
  }
  repo.writeFile(newFile.branch, newFile.path, newFile.content, newFile.message, newFile.options, cb)
  .then((data) => {
    // console.log(data)
    res.status(200).json(data.data)
  })
  .catch((err) => {
    // console.log(err)
    res.status(err.status || err.response.status).json(err.response.data)
  })
}

const deleteRepoFile = (req, res, next) => {
  var repo = req.githubRepo
  var toBeDeleted = req.body

  repo.deleteFile(toBeDeleted.branch, toBeDeleted.path, cb)
  .then((data) => {
    // console.log(data)
    res.status(200).json(data.data)
  })
  .catch((err) => {
    // console.log(err)
    res.status(err.status || err.response.status).json(err.response.data)
  })
}

const listBranches = (req, res, next) => {
  var repo = req.githubRepo
  var { branch } = req.query

  var nextPromise = branch ? repo.getBranch(branch) : repo.listBranches()

  return nextPromise
  .then((data) => {
    // console.log(data)
    res.status(200).json(data.data)
  })
  .catch((err) => {
    // console.log(err)
    res.status(err.status || err.response.status || err.response.status).json(err.response.data)
  })
}

const createBranches = (req, res, next) => {
  var repo = req.githubRepo
  var formData = req.body

  repo.createBranch(formData.oldBranch, formData.newBranch)
  .then((data) => {
    // console.log(data)
    res.status(200).json(data.data)
  })
  .catch((err) => {
    // console.log(err)
    res.status(err.status || err.response.status).json(err.response.data)
  })
}

const getBranchSchema = (req, res, next) => {
  var repo = req.githubRepo
  var { ref, path} = req.query
  path = path || '_schema'

  repo.getContents(ref, path)
  .then((data) => {
    let schemaFiles = data.data.filter((item) => {
      // filter out folder files
      return item.type === 'file'
    })
    .map((item) => {
      return repo.getContents(ref, item.path, true)
        .then((data) => {
          return {name: item.name, data: data.data}
        })
    })

    return Promise.all(schemaFiles)
      .then((results) => {
        res.status(200).json(results)
      })

  })
  .catch((err) => {
    console.log(err)
    res.status(err.status || err.response.status).json(err.response.data)
  })
}

const getRepoBranchIndex = (req, res, next) => {
  var repo = req.githubRepo
  var branch = req.query.branch || 'master'
  var refreshIndex = req.query.refresh === true || req.query.refresh === 'true'
  var repoFullname = req.get('X-REPO-OWNER') + '/' + req.get('X-REPO-NAME')

  //update access token in db, which can be used to run the webhook service
  RepoAccessToken.findOneAndUpdate({
    repository: repoFullname       
  }, {
    repository: repoFullname,
    accessToken: req.user.accessToken,
    updatedBy: req.user.login,
    updated: Date()
  }, {
    upsert: true
  }, (err) => {
    if (err) console.log(err)
  })

  if (refreshIndex) {
    // set flag to clean old db record later if a new index cannot be built
    req.purgeDb = true
    return next()
  }

  RepoIndex.findByRepoInfo(repoFullname, branch, (err, record) => {
    if (err) {
      console.log(err)
      return next()
    }
    if (!record) {
      return next()
    }
    console.log('get database record:',
      record.branch,
      record.repository,
      record.updated
    )
    // some repo branches might have legacy index data built when it didn't have schemas.
    // only return record if it has schemas.
    if (JSON.parse(record.schemas).length) {
      let data = {
        updated: record.updated,
        collections: JSON.parse(record.collections),
        schemas: JSON.parse(record.schemas),
        config: JSON.parse(record.config),
      }
      return res.status(200).json(data)
    }
    // set flag to clean old db record later if a new index cannot be built
    req.purgeDb = true
    // next middleware should be refreshIndexAndSave()
    return next()
  })
}

const refreshIndexAndSave = (req, res) => {
  var repo = req.githubRepo
  var branch = req.query.branch || 'master'
  var repoFullname = req.get('X-REPO-OWNER') + '/' + req.get('X-REPO-NAME')
  var jobKey = repoFullname + '_' + branch

  //avoid doing multiple refresh to same repo branch at same time
  if (RUNNING_JOBS[jobKey]) {
    return res.status(409).json({ message: 'is building index for ' + jobKey, errorCode: 4091 })
  }

  RUNNING_JOBS[jobKey] = true

  return getFreshIndexFromGithub(repo, branch)
    .then(formatedIndex => {
      RepoIndex.findOneAndUpdate({
        repository: repoFullname,
        branch: branch        
      }, {
        repository: repoFullname,
        branch: branch,
        collections: JSON.stringify(formatedIndex.collections),
        schemas: JSON.stringify(formatedIndex.schemas),
        config: JSON.stringify(formatedIndex.config),
        updated: Date()
      }, {
        upsert: true
      }, (err) => {
        if (err) console.log(err)
      })

      delete RUNNING_JOBS[jobKey]

      formatedIndex.updated = new Date()
      return res.status(200).json(formatedIndex)
    })
    .catch((err) => {
      console.log(err)
      delete RUNNING_JOBS[jobKey]

      // remove obsolete index data
      if ((err.status === 404) && req.purgeDb) {
        RepoIndex.findOneAndRemove({
          repository: repoFullname,
          branch: branch        
        }, (dberr, record) => {
          if (dberr) console.log(dberr)
          console.log(repoFullname + ' ' + branch + ' index data was obsolete, thus removed')
        })
      }
      return res.status(err.status || err.response.status).json(err.response.data)    
    })
}

const getFreshIndexFromGithub = (repoObject, branch) => {
  return repoObject.getTree(`${branch}?recursive=1`)
    .then((data) => {
      var treeArray = data.data.tree
      var requestQueue = new TaskQueue(30)
      var formatedIndex = {collections: []}
      var jekyllProConfigReq = Promise.resolve()

      var isJekyllRepo = treeArray.filter((item) => {
        return (item.path === '_config.yml')
      })

      if (isJekyllRepo.length) {
        jekyllProConfigReq = repoObject.getContents(branch, '_config.yml', true)
        .then((data) => {
          formatedIndex['config'] = getLangFromConfigYaml(data.data)
        })
        .catch(err => {
          console.log(err)
        })
      } else {
        jekyllProConfigReq = Promise.reject({
          status: 404,
          response: {
            data: { message: 'Not a valid jekyll repository', errorCode: 4041 }
          }
        })
      }

      var schemaFilesReq = treeArray.filter((item) => {
        return (item.type === 'blob') && (item.path.indexOf('_schemas/') === 0)
      })
      .map((f) => {
        return repoObject.getContents(branch, f.path, true)
          .then((data) => {
            return data.data
          })
          .catch(err => {
            console.log(err)
          })
      })

      var nextPromiseFlow = Promise.all(schemaFilesReq)
        .then(schemas => {
          // if no schemas at all, end the request flow here
          if (!schemas || !schemas.length) {
            return Promise.reject({
              status: 404,
              response: {
                data: { message: 'no schemas of this repository branch!', errorCode: 4042 }
              }
            })
          }

          formatedIndex.schemas = schemas
          var collectionFiles = getCollectionFiles(schemas, treeArray)

          return new Promise((resolve, reject) => {
            collectionFiles.forEach((item, idx) => {
              requestQueue.pushTask(() => {
                let getContentReq = repoObject.getContents(branch, item.path, true)
                  .then((content) => {
                    item.content = content.data
                    return 'ok'
                  })
                let getCommitsReq = repoObject.listCommits({sha: branch, path: item.path})
                  .then((commits) => {
                    var lastCommit = commits.data[0]
                    item.lastCommitSha = lastCommit.sha
                    item.lastUpdatedAt = lastCommit.commit.committer.date
                    item.lastUpdatedBy = lastCommit.commit.committer.name
                    return 'ok'
                  })

                return Promise.all([getContentReq, getCommitsReq])
                  .then((results) => {
                    formatedIndex.collections.push(item)
                    if (idx === collectionFiles.length - 1) {
                      return resolve(formatedIndex)
                    }
                  })
                  .catch(err => {
                    console.log(err)
                    formatedIndex.collections.push(item)
                    if (idx === collectionFiles.length - 1) {
                      return resolve(formatedIndex)
                    }                    
                  })
              })
            })
          })
        })

      return jekyllProConfigReq.then(() => {
        return nextPromiseFlow
      })
    })
}

const listJekyllplusHook = (repoObject, hookUrl) => {
  return repoObject.listHooks()
    .then(list => {
      if (!hookUrl) {
        return list.data
      }
      let arr = list.data.filter((hook) => {
        return hook.config.url === hookUrl
      })
      if (arr.length > 0) {
        return arr[0]
      }
      return null
    })
}

const listHooks = (req, res) => {
  var repo = req.githubRepo
  repo.listHooks()
    .then(data => {
      return res.status(200).json(data.data)
    })
    .catch(err => {
      console.log(err)
      return res.status(err.status || err.response.status).json(err.response.data)
    })
}

const manageHook = (req, res) => {
  var repo = req.githubRepo
  var mergedConfig = Object.assign({}, hookConfig, (req.body.config || {}))
  if (req.body.action === 'create') {
    listJekyllplusHook(repo, mergedConfig.config.url)
      .then(hook => {
        if (hook) {
          return res.status(200).json(hook)
        }
        return repo.createHook(mergedConfig)
      })
      .then(data => {
        return res.status(200).json(data.data)
      })
      .catch(err => {
        console.log(err)
        return res.status(err.status || err.response.status).json(err.response.data)
      })
  }
  if (req.body.action === 'delete') {
    listJekyllplusHook(repo, mergedConfig.config.url)
      .then(hook => {
        if (hook) {
          return repo.deleteHook(hook.id)
            .then(data => {
              return res.status(200).json(data.data)
            })
        }
        return res.status(204).send('no content')
      })
      .catch(err => {
        console.log(err)
        return res.status(err.status || err.response.status).json(err.response.data)
      })
  }
}

const listBranchTree = (req, res) => {
  var repo = req.githubRepo
  var branch = req.query.branch || 'master'
  repo.getTree(`${branch}?recursive=1`)
    .then(data => {
      return res.status(200).json(data.data)
    })
    .catch(err => {
      console.log(err)
      return res.status(err.status || err.response.status).json(err.response.data)
    })
}

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
  refreshIndexAndSave,
  getFreshIndexFromGithub,
  listBranchTree,
  listHooks,
  manageHook
}
