import config from '../config'
import { RepoIndex, RepoAccessToken } from './database'
import GithubAPI from 'github-api'
import _ from 'lodash'
import { getFreshIndexFromGithub } from './repository'
import { TaskQueue, getCollectionFiles } from './utils'

export const hookConfig = {
  'name': 'web',
  'active': true,
  'config': {
    'url': config.serverUrl + '/api/webhook',
    'content_type': 'json'
  }
}

const indexUpdateStrategy = (commits) => {
  var combinedCommits = commits.map(commit => {
    let updated = _.concat(commit.added, commit.modified).map(filepath => {
      return {
        path: filepath,
        lastUpdatedAt: commit.timestamp,
        lastUpdatedBy: commit.committer.name,
        lastCommitSha: commit.id
      }
    })
    return {updated: updated, removed: commit.removed}
  })
  .reduce((prev, current) => {
    prev.updated = _.unionBy(prev.updated, current.updated, 'path')
    prev.removed = _.union(prev.removed, current.removed)
    return prev
  }, { updated: [], removed: [] })
  
  var schemaUpdated = (_.findIndex(combinedCommits.updated, (item) => {
        return item.path.indexOf('_schemas/') === 0
      }) > -1)
    ? true
    : (_.findIndex(combinedCommits.removed, (filename) => {
      return filename.indexOf('_schemas/') === 0
    }) > -1)

  if (schemaUpdated) {
    return { rebuild: true }
  }
  return combinedCommits

}

const saveIndexToDb = (formatedIndex) => {
  return (repoFullName, branch) => {
    RepoIndex.findOneAndUpdate({
      repository: repoFullName,
      branch: branch        
    }, {
      repository: repoFullName,
      branch: branch,
      collections: JSON.stringify(formatedIndex.collections),
      schemas: JSON.stringify(formatedIndex.schemas),
      updated: Date(),
      updatedBy: 'JekyllPlusWebHook'
    }, {
      upsert: true
    }, (err) => {
      if (err) console.log(err)
    })
  }
}

// https://developer.github.com/v3/activity/events/types/#pushevent
export const pushHook = (req, res) => {
  console.log(req.body)
  var {ref, commits, repository} = req.body
  var strategy = indexUpdateStrategy(commits)
  var refs = ref.split('/')
  var branch = refs[refs.length - 1]
  console.log(strategy)
  RepoAccessToken.findOne({repository: repository.full_name}, (err, atk) => {
    if (err) {
      console.log(err)
    }

    let github = new GithubAPI({
      token: atk.accessToken
    })
    let repoObject = github.getRepo(repository.owner.name, repository.name)

    if (strategy.rebuild) {
      // rebuild
      return getFreshIndexFromGithub(repoObject, branch)
        .then(saveIndexToDb(repository.full_name, branch))
    } else {
      // partial update
      RepoIndex.findByRepoInfo(repository.full_name, branch, (err, record) => {
        if (err) {
          console.log(err)
        }
        if (!record) {
          // fresh build
          return getFreshIndexFromGithub(repoObject, branch)
            .then(saveIndexToDb(repository.full_name, branch))
        }
        let existingCollections = JSON.parse(record.collections).filter(file => {
          return (!_.includes(strategy.removed, file.path) && !_.includes(strategy.updated, file.path))
        })
        let newFiles = getCollectionFiles(JSON.parse(record.schemas), strategy.updated)
        let requestQueue = new TaskQueue(5)

        newFiles.forEach((item, idx) => {
          requestQueue.pushTask(() => {
            return repoObject.getContents(branch, item.path, true)
              .then((content) => {
                item.content = content.data
                existingCollections.push(item)

                if (idx === newFiles.length - 1) {
                  RepoIndex.update({_id: record.id}, {collections: JSON.stringify(existingCollections)}, {upsert: true}, (err) => {
                    if (err) console.log(err)
                  })
                }
              })
          })
        })
      })

    }
  })

}

