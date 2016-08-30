import config from '../config'
import githubAPI from 'github-api'

const cb = (error, result, request) => {
  console.log(error)
  console.log(result)
}

const requireGithubAPI = (req, res, next) => {
  if (req.githubRepo) {
    return next()
  }
  var ak = req.user.accessToken || req.user._json.accessToken
  var github = new githubAPI({
    token: ak
  })
  req.githubRepo = github.getRepo(config.repo.user, config.repo.name)
  next()
}

const getRepoContent = (req, res, next) => {
  var repo = req.githubRepo
  repo.getContents()
  .then((data) => {
    // console.log(data)
    res.status(200).json(data.data)
  })
  .catch((err) => {
    console.log(err)
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
    console.log(err)
    res.status(err.status).json(err.response.data)
    // res.status(400).json({message: 'something wrong'})
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
    console.log(err)
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
    console.log(err)
    res.status(err.status).json(err.response.data)
  })
}

export default {
  requireGithubAPI,
  getRepoContent,
  listBranches,
  createBranches,
  writeRepoFile
}