import mongoose from 'mongoose';

import Bluebird from 'bluebird';
mongoose.Promise = Bluebird;

const Schema = mongoose.Schema;

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
});

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
});

// collectionType: "posts"
// content: "---\ntitle: Hello World..."
// lastCommitSha: "966a95de..."
// lastUpdatedAt: '2017-06-12T10:06:23Z'
// lastUpdatedBy: "Jone Doe"
// path: "_posts/2016-10-19-hello-world.md"
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
});

repoIndexSchema.statics.findByRepoInfo = function(repository, branch, cb) {
  return this.findOne({ repository, branch }, cb);
};

export const RepoIndex = mongoose.model('RepoIndex', repoIndexSchema);
export const RepoAccessToken = mongoose.model(
  'RepoAccessToken',
  repoAccessTokenSchema
);
export const RepoFileEntry = mongoose.model(
  'RepoFileEntry',
  repoFileEntrySchema
);
