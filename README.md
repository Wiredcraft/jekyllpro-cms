# JekyllPro CMS

A Web interface to manage your Jekyll site content.

It contains two parts:

- Node.js based backend service provides abstrations for Github API on user authentication, repository operations etc.
  It also cache the collection&schema files content for fast rendering experiences.

  See `api/` [README](api/README.md)

- React.js based WebApp to view and edit relevant content files.

  See `client/` [README](client/README.md)

## Prerequisite
* node.js: >=8.9.0
* mongodb: 3.x

## How to develop in local
* Install Mongodb
* `$ npm install`
* `$ export GITHUB_CLIENT_ID=yourGithubClient`
* `$ export GITHUB_CLIENT_SECRETE=yourGithubClientSecret`
* `$ make dev`

## Product user guide

See [**Wiki**](https://github.com/Wiredcraft/jekyllpro-cms/wiki)
