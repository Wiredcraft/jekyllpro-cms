# API Doc

## Github OAuth

```
GET   /api/auth/github

```
Note you need provide an redirect URL `redirectUrl` in `/config/`.
For example, if you working on `http://localhost:8000/`, put it there, after authentication, it would redirect to your url.

> Cross-domain requests is allowed for configured origin(development setting is `http://localhost:8000`), see `cors` option setting in `/config/`**

> **When making following api request, remember to set `withCredentials` to `true`**

## check if user is loggend and get user profile

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
## Log user out

```
GET /api/logout
```

## Repository related operations

> Below requests require to have header `X-REPO-OWNER` and `X-REPO-NAME`,
for example, `X-REPO-OWNER: Wiredcraft` and `X-REPO-NAME: jekyllpro-cms` specify the github repository `https://github.com/Wiredcraft/jekyllpro-cms`

### Get repo details

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

### Get repo branch content

```
GET    /api/repository
// it will return content for default branch if not given `?ref=<branch name>`
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

### Get indivadual file content
```
GET /api/repository?ref=[branchName]&path=[filePath]&raw=[true or false]

// raw=true will return the file content in raw data instead of GitHub's normalized format
```
example

`/api/repository?ref=test-dev&path=test/test.MD&raw=true`

```
"test readme file, second modify"
```

`/api/repository?ref=test-dev&path=test/test.MD`
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


### Add/update files to repo

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

### Delete file
```
DELETE /api/repository

// form data {branch: 'master', path: 'filepath'}
```

### List all branches of repo

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

### Create branch

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

### Get git tree of branch

It returns the tree recursively, see [github API #get-a-tree-recursively](https://developer.github.com/v3/git/trees/#get-a-tree-recursively)

```
GET /api/repository/tree?branch=<branchname>
```

### Get collection files index

The index data contains schemas that were read from repository folder `_schemas/`, and the collection files parsed based on predefined schemas.
It also has config info like language setting, last index build time.

```
GET /api/repository/index?branch=<branchname>
// return index from database if saved before, if not providing `branch`, it default to `master`

GET /api/repository/index?branch=<branchname>&refresh=true
// will rebuild a new index from github
```
Example of success response body:
```javascript
    {
        "updated": "2017-02-03T08:49:44.000Z",
        "collections": [
            {
                "path": "_posts/2016-09-08-welcome-to-jekyll.md",
                "collectionType": "posts",
                "lastCommitSha": "7edb850806edaffd031e9897ac2786d1cd1e6045",
                "lastUpdatedAt": "2016-12-29T07:33:02Z",
                "lastUpdatedBy": "GitHub",
                "content": "---\nlayout: post\ntitle: Welcome to Jekyll!\ndate: '2016-09-08 15:56:50 +0800'\ncategories: jekyll update\nauthor: Ronan\ntag:\n  - product\n  - guide\n  - good\n---\nYou’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. You can rebuild the site in many different ways, but the most common way is to run `jekyll serve`, which launches a web server and auto-regenerates your site when a file is updated.\n\nTo add new posts, simply add a file in the `_posts` directory that follows the convention `YYYY-MM-DD-name-of-post.ext` and includes the necessary front matter. Take a look at the source for this post to get an idea about how it works.\n\nJekyll also offers powerful support for code snippets:\n\n{% highlight ruby %}\ndef print_hi(name)\n  puts \"Hi, #{name}\"\nend\nprint_hi('Tom')\n#=> prints 'Hi, Tom' to STDOUT.\n{% endhighlight %}\n\nCheck out the [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].\n\n[jekyll-docs]: http://jekyllrb.com/docs/home\n[jekyll-gh]:   https://github.com/jekyll/jekyll\n[jekyll-talk]: https://talk.jekyllrb.com/\n"
            },
            {
                "path": "en/index.html",
                "collectionType": "pages",
                "content": "---\nlang: en\nlayout: front\ntitle: The Best Coffee and Espresso Drinks\n---\n",
                "lastCommitSha": "c7c3d341e06a486b6ce6457c3d1cc03d9dee178b",
                "lastUpdatedAt": "2016-12-01T09:27:26Z",
                "lastUpdatedBy": "Kate Wu"
            },
            {
                "path": "_products/teavana.md",
                "collectionType": "products",
                "content": "---\nlang: cn\ntitle: Teavana\nheader: /media/header-teavana.png\nexcerpt: Updated\ncover: /media/cover-teavana.jpg\npreview: /media/product-teavana.png\nactions:\n  - label: 阅读更多\n    url: /more\n  - label: 更多关于饮料\n    url: /drinks\nexperiment: 118442932-0\npromoted: true\ncategory: Tea\n---\nUpdated body",
                "lastCommitSha": "709ef32fc3cbf7c8ee88ef692c2b28aa0e350327",
                "lastUpdatedAt": "2017-01-03T05:16:45Z",
                "lastUpdatedBy": "Kate Wu"
            },
            {
                "path": "index.html",
                "collectionType": "pages",
                "content": "---\nlayout: front\ntitle: The Best Coffee and Espresso Drinks\nlang: cn\n---\n## test\n\n<h1>title</h2>",
                "lastCommitSha": "f8cac62aafea5e8e0c0949f0ad408e8ac32b4459",
                "lastUpdatedAt": "2016-12-30T10:13:19Z",
                "lastUpdatedBy": "Kate Wu"
            }
        ],
        "schemas": [
            {
                "title": "Pages",
                "jekyll": {
                    "type": "content",
                    "id": "pages",
                    "dir": "_pages"
                },
                "JSONSchema": {
                    "type": "object",
                    "required": [
                        "body"
                    ],
                    "properties": {
                        "layout": {
                            "type": "string",
                            "title": "Layout"
                        },
                        "title": {
                            "type": "string",
                            "title": "Title"
                        },
                        "experiment": {
                            "type": "string",
                            "title": "Experiment"
                        },
                        "body": {
                            "type": "string",
                            "title": "Body"
                        }
                    }
                },
                "uiSchema": {
                    "body": {
                        "ui:widget": "customCodeMirror"
                    }
                }
            },
            {
                "title": "Posts",
                "jekyll": {
                    "type": "content",
                    "id": "posts",
                    "dir": "_posts"
                },
                "JSONSchema": {
                    "type": "object",
                    "required": [
                        "title",
                        "date",
                        "author"
                    ],
                    "properties": {
                        "title": {
                            "type": "string",
                            "title": "Title"
                        },
                        "date": {
                            "type": "string",
                            "title": "Creation Date"
                        },
                        "category": {
                            "type": "string",
                            "title": "Category",
                            "enum": [
                                "Marketing",
                                "DevOps",
                                "Development",
                                "Operation",
                                "Design"
                            ]
                        },
                        "author": {
                            "type": "string",
                            "title": "Author"
                        },
                        "tag": {
                            "type": "array",
                            "title": "tags",
                            "items": {
                                "type": "string"
                            }
                        },
                        "body": {
                            "type": "string",
                            "title": "Body"
                        }
                    }
                },
                "uiSchema": {
                    "category": {
                        "ui:widget": "customSelect"
                    },
                    "body": {
                        "ui:widget": "customCodeMirror"
                    }
                }
            },
            {
                "title": "Products",
                "jekyll": {
                    "type": "content",
                    "id": "products",
                    "dir": "_products"
                },
                "JSONSchema": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "title": "Title"
                        },
                        "header": {
                            "type": "string",
                            "title": "Header"
                        },
                        "excerpt": {
                            "type": "string",
                            "title": "Excerpt"
                        },
                        "cover": {
                            "type": "string",
                            "title": "Cover"
                        },
                        "preview": {
                            "type": "string",
                            "title": "Preview"
                        },
                        "experiment": {
                            "type": "string",
                            "title": "Experiment"
                        },
                        "category": {
                            "type": "string",
                            "title": "Category",
                            "enum": [
                                "Coffee",
                                "Tea",
                                "Food",
                                "Card",
                                "Coffeehouse"
                            ]
                        },
                        "promoted": {
                            "type": "boolean",
                            "title": "Promoted"
                        },
                        "actions": {
                            "type": "array",
                            "title": "Actions",
                            "items": {
                                "type": "object",
                                "required": [
                                    "label"
                                ],
                                "properties": {
                                    "label": {
                                        "type": "string",
                                        "title": "label"
                                    },
                                    "url": {
                                        "type": "string",
                                        "title": "url"
                                    }
                                }
                            }
                        },
                        "body": {
                            "type": "string",
                            "title": "Content"
                        }
                    },
                    "required": [
                        "title",
                        "header",
                        "excerpt",
                        "cover",
                        "category"
                    ]
                },
                "uiSchema": {
                    "body": {
                        "ui:widget": "customCodeMirror"
                    }
                }
            },
                "uiSchema": {
                    "password": {
                        "ui:widget": "password",
                        "ui:help": "This is a hint!"
                    },
                    "text": {
                        "ui:widget": "textarea"
                    },
                    "preview": {
                        "ui:widget": "FilePicker"
                    },
                    "body": {
                        "ui:widget": "customCodeMirror"
                    }
                }
            }
        ],
        "config": {
            "languages": [
                {
                    "name": "Chinese",
                    "code": "zh"
                },
                {
                    "name": "English",
                    "code": "en"
                }
            ]
        }
    }
```


