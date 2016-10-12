import mongoose from 'mongoose'

const Schema = mongoose.Schema

const repoSchema = new Schema({
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
  collections: {
    type: String,
    default: '[]',
    trim: true
  },
  schemas: {
    type: String,
    default: '[]',
    trim: true
  },
  updatedBy: {
    type: String,
    default: ''
  }
})

const repoAccessTokenSchema = new Schema({
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
  accessToken: {
    type: String,
    default: '',
    trim: true,
    required: 'accessToken cannot be blank'
  },
  updatedBy: {
    type: String,
    default: ''
  }
})

repoSchema.statics.findByRepoInfo = function (repository, branch, cb) {
  return this.findOne({ repository, branch }, cb)
}

export const RepoIndex = mongoose.model('RepoIndex', repoSchema)

export const RepoAccessToken = mongoose.model('RepoAccessToken', repoAccessTokenSchema)
