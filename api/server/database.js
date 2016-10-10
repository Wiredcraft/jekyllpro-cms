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

repoSchema.statics.findByRepoInfo = function (repository, branch, cb) {
  return this.findOne({ repository, branch }, cb)
}

const RepoIndexModel = mongoose.model('RepoIndex', repoSchema)

export default RepoIndexModel
