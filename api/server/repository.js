import config from '../config'
import GithubAPI from 'github-api'
import _ from 'lodash'
import { TaskQueue, getCollectionFiles } from './utils'
import { RepoIndex, RepoAccessToken } from './database'
import { hookConfig } from './webhook'

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
      'default_branch'
    ])
    details.owner = _.pick(data.data.owner, [
      'login',
      'type'
    ])
    res.status(200).json(details)
  })
  .catch((err) => {
    // console.log(err)
    res.status(err.status).json(err.response.data)
  })
}

const getRepoContent = (req, res, next) => {
  var repo = req.githubRepo
  var { ref, path, raw } = req.query

  repo.getContents(ref, path, raw)
  .then((data) => {
    // console.log(data)
    res.status(200).json(data.data)
  })
  .catch((err) => {
    // console.log(err)
    res.status(err.status).json(err.response.data)
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
    res.status(err.status).json(err.response.data)
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
    res.status(err.status).json(err.response.data)
  })
}

const listBranches = (req, res, next) => {
  var repo = req.githubRepo
  repo.listBranches()
  .then((data) => {
    // console.log(data)
    res.status(200).json(data.data)
  })
  .catch((err) => {
    // console.log(err)
    res.status(err.status).json(err.response.data)
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
    res.status(err.status).json(err.response.data)
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
    res.status(err.status).json(err.response.data)
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
    console.log(record)
    let data = {collections: JSON.parse(record.collections), schemas: JSON.parse(record.schemas)}
    return res.status(200).json(data)
  })
}

const refreshIndexAndSave = (req, res) => {
  var repo = req.githubRepo
  var branch = req.query.branch || 'master'
  var repoFullname = req.get('X-REPO-OWNER') + '/' + req.get('X-REPO-NAME')

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
        updated: Date()
      }, {
        upsert: true
      }, (err) => {
        if (err) console.log(err)
      })
      return res.status(200).json(formatedIndex)
    })
    .catch((err) => {
      console.log(err)
      return res.status(err.status).json(err.response.data)    
    })
}

const getFreshIndexFromGithub = (repoObject, branch) => {
  return repoObject.getTree(`${branch}?recursive=1`)
    .then((data) => {
      var treeArray = data.data.tree
      var requestQueue = new TaskQueue(3)
      var formatedIndex = {collections: []}
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

      return Promise.all(schemaFilesReq)
        .then(schemas => {
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
      return res.status(err.status).json(err.response.data)
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
        return res.status(err.status).json(err.response.data)
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
        return res.status(err.status).json(err.response.data)
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
      return res.status(err.status).json(err.response.data)
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
