export function parseFilesMeta(rawSchemas) {
  return rawSchemas.map(d => ({
    name: d.name.replace('.json', ''),
    path: d.path,
    url: d.url
  }))
}

export function parseFolderFromSchema(schema, type) {
  if (typeof schema === 'string') {
    type = schema
    schema = null
  }
  if (schema) {
    let items = schema.filter((obj) => {
        return obj.data.jekyll.type === type
      })
      .map((obj) => {
        return {title: obj.data.title, dir: obj.data.jekyll.dir}
      })
    return items
  }
  return undefined
}

//Hard coded folder data
export function getDefaultFolderStructure() {
  let project = {
    'collection': [
      { title: 'posts', dir: '_posts'}
    ],
    'content': [
      { title: 'pages', dir: '_pages'},
      { title: 'team', dir: '_team'}
    ],
    'others': [
      { title: 'layouts', dir: '_layouts'}
    ]
  };
  return project
}
