import config from '../config'
import GithubAPI from 'github-api'
import _ from 'lodash'

const cb = (error, result, request) => {
  console.log(error)
  console.log(result)
}

const requireGithubAPI = (req, res, next) => {
  if (req.githubRepo) {
    return next()
  }
  var ak = req.get('X-TOKEN') || req.user.accessToken || req.user._json.accessToken
  var github = new GithubAPI({
    token: ak
  })
  req.githubRepo = github.getRepo(config.repo.user, config.repo.name)
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
    if (err.status === 404) {
      return res.status(404).json(err.response.data)
    }
    res.status(400).json({message: 'something wrong'})
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
    if (err.status === 404) {
      return res.status(404).json(err.response.data)
    }
    res.status(400).json({message: 'something wrong'})
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
    // res.status(400).json({message: 'something wrong'})
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
    if (err.status === 404) {
      return res.status(404).json(err.response.data)
    }
    res.status(400).json({message: 'something wrong'})
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
    if (err.status === 404) {
      return res.status(404).json(err.response.data)
    }
    res.status(400).json({message: 'something wrong'})
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
  deleteRepoFile
}
