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
* `$ yarn`
* `$ export GITHUB_CLIENT_ID=yourGithubClient`
* `$ export GITHUB_CLIENT_SECRETE=yourGithubClientSecret`
* `$ make dev`

## Deployment
`$ docker-compose up`

#### Environmental variables
```yml
- PORT: application port, default 3000
- DB_ROOT_USERNAME: mongodb admin user name       [required]
- DB_ROOT_PASSWORD: mongodb admin password        [required]
- DB: mongodb database name, e.g.: cms-production [required]
- DB_USERNAME: mongodb application user name      [required]
- DB_PASSWORD: mongodb application password       [required]
- GITHUB_CLIENT_ID: github client id              [required]
- GITHUB_CLIENT_SECRET: github client secret      [required]
- SERVER_URL: default http://localhost:3000       [required]
- SESSION_SECRET: session secret, default WIREDCRAFT
```

## Product user guide

See [**Wiki**](https://github.com/Wiredcraft/jekyllpro-cms/wiki)
