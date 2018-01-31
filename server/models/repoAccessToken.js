'use strict'

const mongoose = require('mongoose')
const { Schema } = mongoose

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

module.exports = mongoose.model('RepoAccessToken', repoAccessTokenSchema)
