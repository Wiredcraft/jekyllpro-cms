import GithubAPI from 'github-api'
import _ from 'lodash'
import Bluebird from 'bluebird'
// import mongoose from 'mongoose'
import _debug from 'debug'

import {
  // TaskQueue,
  getCollectionFiles,
  getCollectionType,
  getCMSConfigFromJekyllYaml
} from './utils'
import { RepoIndex, RepoAccessToken, RepoFileEntry } from './database'
import { hookConfig } from './webhook'

// const ObjectId = mongoose.Types.ObjectId
const debug = _debug('jekyllpro-cms:repository')
const lodash = _ // TODO

const RUNNING_JOBS = {}

const cb = (error, result, request) => {
  console.log(error)
  console.log(result)
}

/**
 * middleware
 * attach repo informatino to `req` - req.repo - { owner, name, fullName }
 * attach github-api instance to `req` - req.githubRepo
 */
const requireGithubAPI = (req, res, next) => {
  if (req.githubRepo) {
    return next()
  }
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

const getRepoDetails = (req, res, next) => {
  const repo = req.githubRepo
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
      ])
      details.owner = _.pick(data.data.owner, ['login', 'avatar_url', 'type'])
      return res.status(200).json(details)
    })
    .catch(err => {
      debug('getRepoDetails error', err)
      return res.status(err.response.status).json(err.response.data)
    })
}

const getRepoContent = (req, res, next) => {
  const repo = req.githubRepo
  const { branch, path, raw } = req.query

  return repo
    .getContents(branch, path, raw)
    .then(data => {
      return res.status(200).json(data.data)
    })
    .catch(err => {
      debug('getRepoContent error', err)
      return res
        .status(err.status || err.response.status)
        .json(err.response.data)
    })
}

const writeRepoFile = (req, res, next) => {
  var repo = req.githubRepo
  var newFile = req.body
  if (!newFile.options) {
    newFile.options = { encode: true }
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
      return res.status(200).json(data.data)
    })
    .catch(err => {
      debug('writeRepoFile error: ', err)
      return res
        .status(err.status || err.response.status)
        .json(err.response.data)
    })
}

const deleteRepoFile = (req, res, next) => {
  var repo = req.githubRepo
  var toBeDeleted = req.body

  return repo
    .deleteFile(toBeDeleted.branch, toBeDeleted.path, cb)
    .then(data => {
      return res.status(200).json(data.data)
    })
    .catch(err => {
      debug('deleteRepoFile error: ', err)
      return res
        .status(err.status || err.response.status)
        .json(err.response.data)
    })
}

const listBranches = (req, res, next) => {
  var repo = req.githubRepo
  var { branch } = req.query

  var nextPromise = branch ? repo.getBranch(branch) : repo.listBranches()

  return nextPromise
    .then(data => {
      return res.status(200).json(data.data)
    })
    .catch(err => {
      debug('listBranches error: ', err)
      return res
        .status(err.status || err.response.status || err.response.status)
        .json(err.response.data)
    })
}

const createBranches = (req, res, next) => {
  const repo = req.githubRepo
  const formData = req.body

  return repo
    .createBranch(formData.oldBranch, formData.newBranch)
    .then(data => {
      return res.status(200).json(data.data)
    })
    .catch(err => {
      debug('createBranches error: ', err)
      return res
        .status(err.status || err.response.status)
        .json(err.response.data)
    })
}

const getBranchSchema = (req, res, next) => {
  var repo = req.githubRepo
  var { ref, path } = req.query
  path = path || '_schema'

  repo
    .getContents(ref, path)
    .then(data => {
      let schemaFiles = data.data
        .filter(item => {
          // filter out folder files
          return item.type === 'file'
        })
        .map(item => {
          return repo.getContents(ref, item.path, true).then(data => {
            return { name: item.name, data: data.data }
          })
        })

      return Promise.all(schemaFiles).then(results => {
        res.status(200).json(results)
      })
    })
    .catch(err => {
      console.log(err)
      res.status(err.status || err.response.status).json(err.response.data)
    })
}

const getRepoBranchIndex = (req, res, next) => {
  // var repo = req.githubRepo
  var branch = req.query.branch || 'master'
  const refreshIndex =
    req.query.refresh === true || req.query.refresh === 'true'
  const repoFullname = req.repo.fullName

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
      if (err) console.log(err)
    }
  )

  if (refreshIndex) {
    // set flag to clean old db record later if a new index cannot be built
    req.purgeDb = true
    return next()
  }

  return RepoIndex.findOne({
    repository: repoFullname,
    branch
  })
    .then(record => {
      if (!record) return next()
      debug(
        'get database record:',
        record._id,
        record.repository,
        record.branch,
        record.updated,
        record.tipCommitSha
      )
      // collections now should be an array though unpopulated
      if (record.tipCommitSha) {
        return RepoFileEntry.find({
          repoBranch: record
        })
          .sort({
            lastUpdatedAt: 'desc'
          })
          .exec()
          .then(collections => {
            if (collections.length === 0) {
              req.purgeDb = true
              return next()
            }

            debug('collections.length', collections.length)
            let data = {
              collections,
              updated: record.updated,
              schemas: JSON.parse(record.schemas),
              config: JSON.parse(record.config)
            }
            return res.status(200).json(data)
          })
      } else {
        debug('record invalid')
        // set flag to clean old db record later if a new index cannot be built
        req.purgeDb = true
        // next middleware should be refreshIndexAndSave()
        return next()
      }
    })
    .catch(err => {
      debug('getRepoBranchIndex error: ', err)
      return next()
    })
}

const getRepoBranchUpdatedCollections = (req, res) => {
  const repo = req.githubRepo
  const branch = req.query.branch || 'master'
  const repoFullname = req.repo.fullName
  // TODO
  // currently refreshIndexIncremental will always resolve
  // but we need to figure
  return refreshIndexIncremental({
    github: repo,
    repoFullname,
    branch
  })
    .then(updatedContent => res.status(200).json(updatedContent))
    .catch(err => {
      debug('getRepoBranchUpdatedCollections error: ', err)
      return res
        .status(err.status || err.response.status)
        .json(err.response.data)
    })
}

const refreshIndexAndSave = (req, res) => {
  const repo = req.githubRepo
  const branch = req.query.branch || 'master'
  const repoFullname = req.repo.fullName
  debug(`refreshIndexAndSave - ${repoFullname}`)

  const jobKey = `${repoFullname}:${branch}`
  // avoid doing multiple refresh to same repo branch at same time
  if (RUNNING_JOBS[jobKey] === true) {
    return res.status(409).json({
      message: `is building index for ${jobKey}`,
      errorCode: 4091
    })
  }

  RUNNING_JOBS[jobKey] = true

  const startTime = new Date()
  return getFreshIndexFromGithub({
    repoObject: repo,
    repoFullname,
    branch
  })
    .then(formatedIndex => {
      debug(`it takes ${new Date() - startTime}ms to build the complete index`)

      delete RUNNING_JOBS[jobKey]
      return res.json(formatedIndex)
    })
    .catch(err => {
      debug('refreshIndexAndSave error: ', err)
      delete RUNNING_JOBS[jobKey]

      // remove obsolete index data
      if (err.status === 404 && req.purgeDb) {
        deleteARepoIndex({ repository: repoFullname, branch }).catch(err => {
          debug('db error', err)
        })
      }
      return res
        .status(err.status || err.response.status)
        .json(err.response.data)
    })
}

const listHooks = (req, res) => {
  var repo = req.githubRepo
  repo
    .listHooks()
    .then(data => {
      return res.status(200).json(data.data)
    })
    .catch(err => {
      console.log(err)
      return res
        .status(err.status || err.response.status)
        .json(err.response.data)
    })
}

const manageHook = (req, res) => {
  var repo = req.githubRepo
  var mergedConfig = Object.assign({}, hookConfig, req.body.config || {})
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
        return res
          .status(err.status || err.response.status)
          .json(err.response.data)
      })
  }
  if (req.body.action === 'delete') {
    listJekyllplusHook(repo, mergedConfig.config.url)
      .then(hook => {
        if (hook) {
          return repo.deleteHook(hook.id).then(data => {
            return res.status(200).json(data.data)
          })
        }
        return res.status(204).send('no content')
      })
      .catch(err => {
        console.log(err)
        return res
          .status(err.status || err.response.status)
          .json(err.response.data)
      })
  }
}

const listBranchTree = (req, res) => {
  var repo = req.githubRepo
  var branch = req.query.branch || 'master'
  repo
    .getTree(`${branch}?recursive=1`)
    .then(data => {
      return res.status(200).json(data.data)
    })
    .catch(err => {
      console.log(err)
      return res
        .status(err.status || err.response.status)
        .json(err.response.data)
    })
}

/**
 * @return {Promise<collections>} - {collections: { modified: Array, removed: Array }}
 */
function refreshIndexIncremental ({ github, repoFullname, branch }) {
  debug(`refreshIndexIncremental ${repoFullname}:${branch}`)
  let repoIndex = null
  let schemaArray = null
  let schemaUpdated = false
  let tipCommitSha = null
  let newAndRemovedSchemas = []
  let newConfig = null
  const updatedContent = {
    collections: {
      modified: [], // consider added as modified
      removed: []
    }
  }

  // throttle
  const jobKey = `refreshIndexIncremental:${repoFullname}:${branch}`
  if (RUNNING_JOBS[jobKey]) {
    debug('another refreshIndexIncremental task is running, returning')
    return Promise.resolve(updatedContent)
  }
  RUNNING_JOBS[jobKey] = true
  const dispose = () => {
    delete RUNNING_JOBS[jobKey]
  }

  // get last commit
  return Promise.all([
    RepoIndex.findOne({ repository: repoFullname, branch }),
    github.getRef(`heads/${branch}`)
  ])
    .then(([_repoIndex, refData]) => {
      if (!_repoIndex || !_repoIndex.tipCommitSha) {
        debug(
          'Error: no tipCommitSha on %s repoIndex %s',
          repoFullname,
          (_repoIndex && _repoIndex._id) || 'n/a'
        )
        throw new Error('break')
      }

      tipCommitSha = lodash.get(refData, 'data.object.sha')
      // can not get the commit sha
      if (typeof tipCommitSha !== 'string') { throw new Error('invalid tipCommitSha') }
      // the commit sha is same as the one in database
      if (tipCommitSha === _repoIndex.tipCommitSha) { throw new Error('no change in tipCommitSha') }

      debug(
        `tip commit: db is ${_repoIndex.tipCommitSha} remote is ${tipCommitSha}`
      )
      repoIndex = _repoIndex
      schemaArray = JSON.parse(repoIndex.schemas)

      // doc https://developer.github.com/v3/repos/commits/#compare-two-commits
      return github.compareBranches(repoIndex.tipCommitSha, branch)
    })
    .then(data => {
      debug(
        '%d commits between %s and %s',
        data.data.total_commits,
        repoIndex.tipCommitSha,
        branch
      )
      debug('files %j', data.data.files)

      const committedFiles = data.data.files
      let configChange = committedFiles.filter(
        s => s.filename === '_config.yml'
      )

      if (configChange.length === 0) {
        return Bluebird.resolve(committedFiles)
      }

      return github
        .getContents(branch, '_config.yml', true)
        .then(data => {
          newConfig = getCMSConfigFromJekyllYaml(data.data)
          debug('New config %s', newConfig)

          return committedFiles
        })
        .catch(err => {
          console.log(err)
        })
    })
    .then(committedFiles => {
      const schemaChanges = committedFiles.filter(
        s => s.filename.indexOf('_schemas/') === 0
      )
      let collectionChanges = committedFiles.filter(s =>
        /\.(html|md|markdown)$/i.test(s.filename)
      )
      if (schemaChanges.length === 0) {
        return Bluebird.resolve(collectionChanges)
      }
      // process schema changes first
      schemaUpdated = true

      return Bluebird.map(
        schemaChanges,
        schema => {
          let schemaId = /^_schemas\/(\w+)\.json$/gi.exec(schema.filename)[1]
          let changedItem = schemaArray.find(s => s.jekyll.id === schemaId)
          // remove either removed or modified schema file from original schemaArray
          schemaArray = schemaArray.filter(s => s.jekyll.id !== schemaId)
          if (schema.status === 'removed') {
            newAndRemovedSchemas.push(
              Object.assign({ status: 'removed' }, changedItem)
            )
            return Bluebird.resolve()
          }
          return github
            .getContents(branch, schema.filename, true)
            .then(data => {
              let fileCont = data.data
              // make sure only process valid schema
              if (typeof fileCont === 'string') {
                return Bluebird.resolve()
              }
              if (schema.status === 'added') {
                newAndRemovedSchemas.push(
                  Object.assign({ status: 'added' }, fileCont)
                )
              }
              schemaArray.push(fileCont)
            })
        },
        {
          concurrency: 5
        }
      ).then(() => {
        if (newAndRemovedSchemas.length > 0) {
          debug('New and Removed schema files %j', newAndRemovedSchemas)
          return github
            .getContents(branch)
            .then(data => {
              var rootDirCont = data.data

              return Bluebird.map(
                newAndRemovedSchemas,
                schema => {
                  let cfolder = rootDirCont.find(
                    c => c.path === schema.jekyll.dir
                  )
                  // the folder might not be existed
                  if (!cfolder) return Bluebird.resolve()
                  return github
                    .getTree(`${cfolder.sha}?recursive=1`)
                    .then(data => {
                      let nrFiles = data.data.tree
                        .filter(t => t.type === 'blob')
                        .map(f => ({
                          filename: cfolder.path + '/' + f.path,
                          status: schema.status
                        }))

                      collectionChanges = collectionChanges.concat(nrFiles)
                    })
                },
                {
                  concurrency: 5
                }
              )
            })
            .then(() => collectionChanges)
        }
        return collectionChanges
      })
    })
    .then(collectionChanges => {
      debug('Number of Changed collection files %s', collectionChanges.length)
      return Bluebird.map(
        collectionChanges,
        f => {
          const { filename } = f
          debug(`${f.status} filename ${f.filename}`)

          if (f.status === 'removed') {
            return removeEntryOfRepo({
              filename: filename,
              repoIndex
            }).then(removed => {
              if (!removed) return
              updatedContent.collections.removed.push(removed)
            })
          } else {
            const collectionType = getCollectionType(schemaArray, filename)
            if (collectionType === '') {
              return Bluebird.resolve()
            }

            // consider added as modified
            return upsertEntryOfRepo({
              github,
              branch,
              collectionType,
              filename: filename,
              repoIndex
            }).then(modified => {
              if (!modified) return
              updatedContent.collections.modified.push(modified)
            })
          }
        },
        {
          concurrency: 5
        }
      )
    })
    .then(() => {
      if (newConfig) {
        repoIndex.config = JSON.stringify(newConfig)
      }
      if (schemaUpdated) {
        repoIndex.schemas = JSON.stringify(schemaArray)
      }
      // update the tipCommitSha
      repoIndex.tipCommitSha = tipCommitSha
      repoIndex.updated = Date()
      return repoIndex.save()
    })
    .then(() => {
      dispose()
      if (newConfig) {
        updatedContent.config = newConfig
      }
      if (schemaUpdated) {
        updatedContent.schemas = schemaArray
      }
      return updatedContent
    })
    .catch(err => {
      console.log(err)

      dispose()
      return updatedContent
    })
}

/**
 * delete the entry instance and remove it from the repo
 *
 * @param {string} filename
 * @param {object} repoIndex - mongoose RepoIndex doc instance
 * @return {Promise} - resolve to undefined or { _id: string, path: string }
 */
function removeEntryOfRepo ({ filename, repoIndex }) {
  const removed = { path: filename }
  return RepoFileEntry.find({
    path: filename,
    repoBranch: repoIndex
  })
    .remove()
    .exec()
    .then(() => removed)
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
function upsertEntryOfRepo ({
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
    const content = data.data
    const lastCommit = commits.data[0]

    const cond = {
      path: filename,
      repoBranch: repoIndex
    }
    const entry = {
      collectionType,
      content,
      lastCommitSha: lastCommit.sha,
      lastUpdatedAt: lastCommit.commit.committer.date,
      lastUpdatedBy: lastCommit.commit.committer.name,
      path: filename,
      repoBranch: repoIndex
    }
    const opt = { upsert: true, new: true }
    return RepoFileEntry.findOneAndUpdate(cond, entry, opt).then(entryInst => {
      if (!entryInst) {
        debug('faild to upsert file entry: %o', cond)
        // TODO better throw here
        // return Promise.reject({
        //   status: 500,
        //   response: {
        //     data: {
        //       message: 'unable to create file entry instance in database'
        //       // TODO errorCode
        //     }
        //   }
        // })
      }

      const modified = lodash.pick(entry, [
        'collectionType',
        'content',
        'lastCommitSha',
        'lastUpdatedAt',
        'lastUpdatedBy',
        'path'
      ])

      return modified
    })
  })
}

function saveFileEntry (item, repoIndex) {
  const entry = new RepoFileEntry({
    collectionType: item.collectionType,
    content: item.content,
    lastCommitSha: item.lastCommitSha,
    lastUpdatedAt: item.lastUpdatedAt,
    lastUpdatedBy: item.lastUpdatedBy,
    path: item.path,
    repoBranch: repoIndex
  })
  return entry.save()
}

/**
 * find or create a repoIndex and remove all it's file entries
 *
 * @param {string} repository - repo fullname
 * @param {string} branch
 * @return {Promise<repoIndex>}
 */
// function findRepoAndCleanEntries ({ repository, branch }) {
//   const cond = { repository, branch }
//   const opts = {
//     upsert: true,
//     new: true
//   }
//   return RepoIndex.findOneAndUpdate(cond, cond, opts).then(repoIndex => {
//     debug('repoIndex id', repoIndex._id)
//     return deleteAllEntriesOfIndex(repoIndex).then(() => repoIndex)
//   })
// }

function deleteARepoIndex ({ repository, branch }) {
  return RepoIndex.findOne({ repository, branch }).then(repoIndex => {
    if (!repoIndex) return
    deleteAllEntriesOfIndex(repoIndex)
    return repoIndex.remove()
  })
}

function deleteAllEntriesOfIndex (repoIndex) {
  return RepoFileEntry.find({
    repoBranch: repoIndex
  })
    .remove()
    .exec()
}

/**
 * @param {string} repoFullname - e.g. `wiredcraft/pipelines`
 */
const getFreshIndexFromGithub = ({ repoObject, repoFullname, branch }) => {
  debug('enter func getFreshIndexFromGithub')
  var formatedIndex = { collections: [] }

  return repoObject
    .getTree(`${branch}?recursive=1`)
    .then(data => {
      var treeArray = data.data.tree
      formatedIndex.tipCommitSha = data.data.sha

      const isJekyllRepo = treeArray.some(
        entry => entry.path === '_config.yml'
      )
      return Bluebird.try(() => {
        if (!isJekyllRepo) {
          // throw {
          //   status: 404,
          //   response: {
          //     data: {
          //       message: 'Not a valid jekyll repository',
          //       errorCode: 4041
          //     }
          //   }
          // }
        }

        return repoObject
          .getContents(branch, '_config.yml', true)
          .then(data => {
            formatedIndex['config'] = getCMSConfigFromJekyllYaml(data.data)
            return treeArray
          })
          .catch(err => {
            console.log(err)
          })
      })
    })
    .then(treeArray => {
      const schemaFiles = treeArray.filter(
        i => i.type === 'blob' && i.path.indexOf('_schemas/') === 0
      )

      return Bluebird.try(() => {
        if (schemaFiles.length === 0) {
          // throw {
          //   status: 404,
          //   response: {
          //     data: {
          //       message: 'no schemas of this repository branch!',
          //       errorCode: 4042
          //     }
          //   }
          // }
        }

        return Bluebird.map(
          schemaFiles,
          f => {
            return repoObject
              .getContents(branch, f.path, true)
              .then(data => data.data)
              .catch(err => console.log(err))
          },
          {
            concurrency: 5
          }
        ).then(schemas => {
          let validSchemas = schemas.filter(s => {
            return typeof s === 'object' && s.jekyll
          })
          if (validSchemas.length === 0) {
            return Bluebird.reject({
              status: 404,
              response: {
                data: {
                  message: 'no schemas of this repository branch!',
                  errorCode: 4042
                }
              }
            })
          }
          formatedIndex.schemas = validSchemas
          // update repoIndex schema, config, tipCommitSha
          debug('update tipCommitSha to %s', formatedIndex.tipCommitSha)
          return RepoIndex.findOneAndUpdate(
            {
              repository: repoFullname,
              branch: branch
            },
            {
              repository: repoFullname,
              branch: branch,
              schemas: JSON.stringify(formatedIndex.schemas),
              config: JSON.stringify(formatedIndex.config),
              tipCommitSha: formatedIndex.tipCommitSha,
              updatedBy: 'refreshed',
              updated: Date()
            },
            {
              upsert: true,
              new: true
            }
          ).then(repoIndex => {
            debug('get repoIndex: %j', {
              _id: repoIndex._id,
              __v: repoIndex.__v,
              updated: repoIndex.updated,
              updatedBy: repoIndex.updatedBy
            })
            debug('clean up old collection files in database')
            return deleteAllEntriesOfIndex(repoIndex).then(() => ({
              repoIndex,
              treeArray,
              schemas: validSchemas
            }))
          })
        })
      }).then(({ repoIndex, treeArray, schemas }) => {
        const collectionFiles = getCollectionFiles(schemas, treeArray)
        debug(
          'got %d entries from GitHub, showing the 1st one %o',
          collectionFiles.length,
          collectionFiles[0]
        )

        return Bluebird.map(
          collectionFiles,
          item => {
            let cfile = Object.assign({}, item)
            let getContentReq = repoObject.getContents(branch, item.path, true)
            let getCommitsReq = repoObject.listCommits({
              sha: branch,
              path: item.path
            })

            return Bluebird.join(
              getContentReq,
              getCommitsReq,
              (content, commits) => {
                var lastCommit = commits.data[0]
                cfile.content = content.data
                cfile.lastCommitSha = lastCommit.sha
                cfile.lastUpdatedAt = lastCommit.commit.committer.date
                cfile.lastUpdatedBy = lastCommit.commit.committer.name

                formatedIndex.collections.push(cfile)
                return saveFileEntry(cfile, repoIndex)
              }
            )
          },
          {
            concurrency: 5
          }
        ).then(() => formatedIndex)
      })
    })
}

const listJekyllplusHook = (repoObject, hookUrl) => {
  return repoObject.listHooks().then(list => {
    if (!hookUrl) {
      return list.data
    }
    let arr = list.data.filter(hook => {
      return hook.config.url === hookUrl
    })
    if (arr.length > 0) {
      return arr[0]
    }
    return null
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
  getRepoBranchUpdatedCollections,
  refreshIndexAndSave,
  getFreshIndexFromGithub,
  listBranchTree,
  listHooks,
  manageHook
}
