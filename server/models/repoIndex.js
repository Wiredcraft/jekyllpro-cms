'use strict'

const mongoose = require('mongoose')
const { Schema } = mongoose

const repoIndexSchema = new Schema({
  updated: {
    type: Date,
    default: Date.now
  },
  repository: {
    type: String,
    default: '',
    trim: true,
    required: 'repository cannot be blank'
  },
  branch: {
    type: String,
    default: 'master',
    trim: true,
    required: 'branch cannot be blank'
  },
  schemas: {
    type: String,
    default: '[]',
    trim: true
  },
  config: {
    type: String,
    default: '[]',
    trim: true
  },
  updatedBy: {
    type: String,
    default: ''
  },
  // tip commit of the branch
  tipCommitSha: {
    type: String,
    default: ''
  }
})

repoIndexSchema.statics.findByRepoInfo = function (repository, branch, cb) {
  return this.findOne({ repository, branch }, cb)
}

module.exports = mongoose.model('RepoIndex', repoIndexSchema)
