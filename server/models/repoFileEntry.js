'use strict'

const mongoose = require('mongoose')
const { Schema } = mongoose

const repoFileEntrySchema = new Schema({
  collectionType: String,
  content: {
    type: String,
    default: ''
  },
  lastCommitSha: String,
  lastUpdatedAt: Date,
  lastUpdatedBy: String,
  path: String,
  repoBranch: Schema.ObjectId
})

module.exports = mongoose.model('RepoFileEntry', repoFileEntrySchema)
