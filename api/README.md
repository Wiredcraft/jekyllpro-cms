# gh-app

### requirement

- Node.js > 4.x

- npm > 3.x

- mongodb 3.x
  
  database uri configuration see files in `config/` folder

- install dependencies

```
  npm install
```

### development

```
npm run dev

// server runs on http://0.0.0.0:3000
```

### Configuration files

In folder `/config/`, to configure options like host, port, github oauth, repository name, etc.

### API

**github OAuth**

```
GET   /api/auth/github

```
Note you need provide an redirect URL `redirectUrl` in `/config/`.
For example, if you working on `http://localhost:8000/`, put it there, after authentication, it would redirect to your url.

> **Cross-domain requests is allowed for configured origin(development setting is `http://localhost:8000`), see `cors` option setting in `/config/`**

> **When making following api request, remember to set `withCredentials` to `true`**

**check if user is loggend and get user profile**

```
GET   /api/me
```

example success response body
```
{
  login: "woodpig07",
  id: 4519861,
  avatar_url: "https://avatars.githubusercontent.com/u/4519861?v=3",
  gravatar_id: "",
  url: "https://api.github.com/users/woodpig07",
  html_url: "https://github.com/woodpig07",
  followers_url: "https://api.github.com/users/woodpig07/followers",
  following_url: "https://api.github.com/users/woodpig07/following{/other_user}",
  gists_url: "https://api.github.com/users/woodpig07/gists{/gist_id}",
  starred_url: "https://api.github.com/users/woodpig07/starred{/owner}{/repo}",
  subscriptions_url: "https://api.github.com/users/woodpig07/subscriptions",
  organizations_url: "https://api.github.com/users/woodpig07/orgs",
  repos_url: "https://api.github.com/users/woodpig07/repos",
  events_url: "https://api.github.com/users/woodpig07/events{/privacy}",
  received_events_url: "https://api.github.com/users/woodpig07/received_events",
  type: "User",
  site_admin: false,
  name: "Kate Wu",
  company: null,
  blog: null,
  location: null,
  email: null,
  hireable: null,
  bio: null,
  public_repos: 9,
  public_gists: 0,
  followers: 4,
  following: 0,
  created_at: "2013-05-24T14:04:07Z",
  updated_at: "2016-08-27T04:03:00Z"
}
```

**get repo details**

```
GET    /api/repository/details

// you can know which is default_branch here
```
example success response body
```
{
  name: "test",
  full_name: "woodpig07/test",
  description: null,
  private: false,
  url: "https://api.github.com/repos/woodpig07/test",
  default_branch: "master",
  owner: {
    login: "woodpig07",
    type: "User"
  }
}
```

**get repo content in json format**

```
GET    /api/repository
// it will return content for default branch if no `?ref=<branch name>`
```
example success response body
```
[
  {
    name: "README.MD",
    path: "README.MD",
    sha: "5ac8e4a339f934e0b9c1aee4b8f7091be28db5f0",
    size: 16,
    url: "https://api.github.com/repos/woodpig07/test/contents/README.MD?ref=master",
    html_url: "https://github.com/woodpig07/test/blob/master/README.MD",
    git_url: "https://api.github.com/repos/woodpig07/test/git/blobs/5ac8e4a339f934e0b9c1aee4b8f7091be28db5f0",
    download_url: "https://raw.githubusercontent.com/woodpig07/test/master/README.MD",
    type: "file",
    _links: {
    self: "https://api.github.com/repos/woodpig07/test/contents/README.MD?ref=master",
    git: "https://api.github.com/repos/woodpig07/test/git/blobs/5ac8e4a339f934e0b9c1aee4b8f7091be28db5f0",
    html: "https://github.com/woodpig07/test/blob/master/README.MD"
    }
  },
  {
    name: "test",
    path: "test",
    sha: "00d505756bfce2043b82ca9a307259bc837463d2",
    size: 0,
    url: "https://api.github.com/repos/woodpig07/test/contents/test?ref=master",
    html_url: "https://github.com/woodpig07/test/tree/master/test",
    git_url: "https://api.github.com/repos/woodpig07/test/git/trees/00d505756bfce2043b82ca9a307259bc837463d2",
    download_url: null,
    type: "dir",
    _links: {
    self: "https://api.github.com/repos/woodpig07/test/contents/test?ref=master",
    git: "https://api.github.com/repos/woodpig07/test/git/trees/00d505756bfce2043b82ca9a307259bc837463d2",
    html: "https://github.com/woodpig07/test/tree/master/test"
    }
  }
]
```

**get indivadual file content**
```
GET /api/repository?ref=[branchName]&path=[filePath]&raw=[true or false]

// raw=true will return the file content in raw data instead of GitHub's normalized format
```
example

`http://localhost:3000/api/repository?ref=test-dev&path=test/test.MD&raw=true`
return
```
"test readme file, second modify"
```

`http://localhost:3000/api/repository?ref=test-dev&path=test/test.MD`
return
```
{
  "name": "test.MD",
  "path": "test/test.MD",
  "sha": "c9e36349dcfb4144d0905d52d44e6f59c07f3f38",
  "size": 31,
  "url": "https://api.github.com/repos/woodpig07/test/contents/test/test.MD?ref=test-dev",
  "html_url": "https://github.com/woodpig07/test/blob/test-dev/test/test.MD",
  "git_url": "https://api.github.com/repos/woodpig07/test/git/blobs/c9e36349dcfb4144d0905d52d44e6f59c07f3f38",
  "download_url": "https://raw.githubusercontent.com/woodpig07/test/test-dev/test/test.MD",
  "type": "file",
  "content": "dGVzdCByZWFkbWUgZmlsZSwgc2Vjb25kIG1vZGlmeQ==\n",
  "encoding": "base64",
  "_links": {
    "self": "https://api.github.com/repos/woodpig07/test/contents/test/test.MD?ref=test-dev",
    "git": "https://api.github.com/repos/woodpig07/test/git/blobs/c9e36349dcfb4144d0905d52d44e6f59c07f3f38",
    "html": "https://github.com/woodpig07/test/blob/test-dev/test/test.MD"
  }
}
```


**add/update files to repo**

```
POST   /api/repository

// form data {branch: 'master', path: 'filename', content: 'content here', message: 'commit message here'}

```

example success response body
```
{
  "content": {
    "name": "tes3333.MD",
    "path": "test/tes3333.MD",
    "sha": "65c769fd184071543c26b96a7257b870e0280123",
    "size": 20,
    "url": "https://api.github.com/repos/woodpig07/test/contents/test/tes3333.MD?ref=master",
    "html_url": "https://github.com/woodpig07/test/blob/master/test/tes3333.MD",
    "git_url": "https://api.github.com/repos/woodpig07/test/git/blobs/65c769fd184071543c26b96a7257b870e0280123",
    "download_url": "https://raw.githubusercontent.com/woodpig07/test/master/test/tes3333.MD",
    "type": "file",
    "_links": {
      "self": "https://api.github.com/repos/woodpig07/test/contents/test/tes3333.MD?ref=master",
      "git": "https://api.github.com/repos/woodpig07/test/git/blobs/65c769fd184071543c26b96a7257b870e0280123",
      "html": "https://github.com/woodpig07/test/blob/master/test/tes3333.MD"
    }
  },
  "commit": {
    "sha": "929743aa8354cc37ac69e13ad2abaaa6d0b5994a",
    "url": "https://api.github.com/repos/woodpig07/test/git/commits/929743aa8354cc37ac69e13ad2abaaa6d0b5994a",
    "html_url": "https://github.com/woodpig07/test/commit/929743aa8354cc37ac69e13ad2abaaa6d0b5994a",
    "author": {
      "name": "Kate Wu",
      "email": "woodpig07@gmail.com",
      "date": "2016-08-29T09:45:22Z"
    },
    "committer": {
      "name": "Kate Wu",
      "email": "woodpig07@gmail.com",
      "date": "2016-08-29T09:45:22Z"
    },
    "tree": {
      "sha": "9f3471028bbc5d6fc38b61b1197bb211a07929a8",
      "url": "https://api.github.com/repos/woodpig07/test/git/trees/9f3471028bbc5d6fc38b61b1197bb211a07929a8"
    },
    "message": "this file is updated by app",
    "parents": [
      {
        "sha": "a7e402b4bd914ce270184559d752512e60782547",
        "url": "https://api.github.com/repos/woodpig07/test/git/commits/a7e402b4bd914ce270184559d752512e60782547",
        "html_url": "https://github.com/woodpig07/test/commit/a7e402b4bd914ce270184559d752512e60782547"
      }
    ]
  }
}
```

**delete file**
```
DELETE /api/repository

// form data {branch: 'master', path: 'filepath'}
```

**list all branches**

```
GET /api/repository/branch
```

Example success response body
```
[
  {
    "name": "master",
    "commit": {
      "sha": "929743aa8354cc37ac69e13ad2abaaa6d0b5994a",
      "url": "https://api.github.com/repos/woodpig07/test/commits/929743aa8354cc37ac69e13ad2abaaa6d0b5994a"
    }
  },
  {
    "name": "test-dev",
    "commit": {
      "sha": "929743aa8354cc37ac69e13ad2abaaa6d0b5994a",
      "url": "https://api.github.com/repos/woodpig07/test/commits/929743aa8354cc37ac69e13ad2abaaa6d0b5994a"
    }
  }
]
```

**create branch**

```
POST /api/repository/branch

// form data {oldBranch: "master", newBranch: "newBranchName"}
```

Example success response body
```
{
  "ref": "refs/heads/test-dev",
  "url": "https://api.github.com/repos/woodpig07/test/git/refs/heads/test-dev",
  "object": {
    "sha": "929743aa8354cc37ac69e13ad2abaaa6d0b5994a",
    "type": "commit",
    "url": "https://api.github.com/repos/woodpig07/test/git/commits/929743aa8354cc37ac69e13ad2abaaa6d0b5994a"
  }
}
```