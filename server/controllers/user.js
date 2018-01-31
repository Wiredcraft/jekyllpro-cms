'use strict'

const GithubAPI = require('github-api')
const { pick } = require('lodash')

// var noReturnUrls = ['/login']

exports.getUserInfo = (req, res) => {
  if (req.user) {
    var info = Object.assign({}, req.user)
    delete info.accessToken
    delete info.refreshToken
    res.status(200).send(info)
  } else if (req.get('X-TOKEN')) {
    var gh = new GithubAPI({ token: req.get('X-TOKEN') })
    gh
      .getUser()
      .getProfile()
      .then(data => {
        // console.log(data)
        res.status(200).json(data.data)
      })
      .catch(err => {
        // console.log(err)
        if (err.status === 404) {
          return res.status(404).json(err.response.data)
        }
        res.status(401).send({ error: 'not authorized' })
      })
  } else {
    res.status(401).send({ error: 'not authorized' })
  }
}

exports.listUserOrgs = (req, res) => {
  var gh = new GithubAPI({ token: req.user.accessToken })
  gh
    .getUser()
    .listOrgs()
    .then(data => {
      res.status(200).json(data.data)
    })
    .catch(err => {
      console.log(err)
      res.status(err.status || err.response.status).json(err.response.data)
    })
}

exports.listUserRepos = (req, res) => {
  // var { type, sort, direction } = req.query
  var gh = new GithubAPI({ token: req.user.accessToken })
  gh
    .getUser()
    .listRepos(req.query)
    .then(data => {
      let list = data.data.map(item => {
        let newItem = pick(item, [
          'id',
          'name',
          'full_name',
          'private',
          'description',
          'url',
          'created_at',
          'updated_at',
          'default_branch',
          'permissions'
        ])
        newItem.owner = pick(item.owner, [
          'login',
          'avatar_url',
          'url',
          'type',
          'site_admin'
        ])
        return newItem
      })
      res.status(200).json(list)
    })
    .catch(err => {
      console.log(err)
      res.status(err.status || err.response.status).json(err.response.data)
    })
}
