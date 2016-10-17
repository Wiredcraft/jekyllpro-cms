/* global API_BASE_URL */
import superagent from 'superagent'
import Cookie from 'js-cookie'

const request = (method, url) => {
  return superagent(method, url)
    .withCredentials()
}

const repoRequest = (method, url) => {
  return superagent(method, url)
    .set('X-REPO-OWNER', Cookie.get('repoOwner'))
    .set('X-REPO-NAME', Cookie.get('repoName'))
    .withCredentials()
}

const generalResponseHandler = (resolve, reject) => {
  return function (err, res) {
    if (err) {
      console.error(err)
      return reject(err)
    } 
    return resolve(res.body)
  }
}

const setQueryParam = (options) => {
  var params = []
  Object.keys(options)
    .forEach(prop => {
      if (options[prop]) {
        params.push(`${prop}=${options[prop]}`)
      }
    })
  return '?' + params.join('&')
}

export function getUser () {
  return new Promise((resolve, reject) => {
    request('GET', `${API_BASE_URL}/api/me`)
      .end(generalResponseHandler(resolve, reject))
  })
}

export function logoutUser () {
  return new Promise((resolve, reject) => {
    request('GET', `${API_BASE_URL}/logout`)
      .end(generalResponseHandler(resolve, reject))
  })
}

export function getUserOrgs () {
  return new Promise((resolve, reject) => {
    request('GET', `${API_BASE_URL}/api/me/orgs`)
      .end(generalResponseHandler(resolve, reject))
  })
}

export function getUserRepos (opts) {
  var requestUrl = `${API_BASE_URL}/api/me/repos` + setQueryParam(opts || {})
  return new Promise((resolve, reject) => {
    request('GET', requestUrl)
      .end(generalResponseHandler(resolve, reject))
  }) 
}

export function getRepoDetails () {
  return new Promise((resolve, reject) => {
    repoRequest('GET', `${API_BASE_URL}/api/repository/details`)
      .end(generalResponseHandler(resolve, reject))
  })
}

export function getRepoMeta ({ branch, path, raw }) {
  var requestUrl = `${API_BASE_URL}/api/repository` + setQueryParam({ branch, path, raw })

  return new Promise((resolve, reject) => {
    repoRequest('GET', requestUrl)
      .end(generalResponseHandler(resolve, reject))
  })
}

export function getRepoBranchList () {
  return new Promise((resolve, reject) => {
    repoRequest('GET', `${API_BASE_URL}/api/repository/branch`)
      .end(generalResponseHandler(resolve, reject))
  }) 
}

export function updateRepoFile ({ branch, path, content, message }) {
  return new Promise((resolve, reject) => {
    repoRequest('POST', `${API_BASE_URL}/api/repository`)
      .send({ branch, path, content, message: message || `update ${path}` })
      .end(generalResponseHandler(resolve, reject))
  }) 
}

export function deleteRepoFile ({ branch, path }) {
  return new Promise((resolve, reject) => {
    repoRequest('DELETE', `${API_BASE_URL}/api/repository`)
      .send({ branch, path })
      .end(generalResponseHandler(resolve, reject))
  }) 
}

export function getRepoIndex ({ branch, refresh }) {
  branch = branch ? branch : 'master'
  refresh = refresh ? refresh : false
  var requestUrl = `${API_BASE_URL}/api/repository/index?branch=${branch}&refresh=${refresh}`
  return new Promise((resolve, reject) => {
    repoRequest('GET', requestUrl)
      .end(generalResponseHandler(resolve, reject))
  })
}

export function getRepoTree (branch) {
  branch = branch ? branch : 'master'
  var requestUrl = `${API_BASE_URL}/api/repository/tree?branch=${branch}`
  return new Promise((resolve, reject) => {
    repoRequest('GET', requestUrl)
      .end(generalResponseHandler(resolve, reject))
  })
}

