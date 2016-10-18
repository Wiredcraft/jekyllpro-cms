export function dateToString (dateObj) {
  return [dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()].join('-')
}

export function purgeObject (obj) {
  Object.keys(obj).forEach(prop => {
    if (obj[prop] === undefined) {
      delete obj[prop]
    }
  })
}

export function parseFileTree (treeArray) {
  let directory = { _contents: [] }

  let files = treeArray.filter((item) => {
    return item.type === 'blob'
  })
  let folders = treeArray.filter((item) => {
    return item.type === 'tree'
  })
  folders.forEach(item => {
    let pathStr = item.path.split('/')
    var p = directory
    pathStr.forEach((s) => {
      if (!p[s]) {
        p[s] = { _contents: [] }
      }
      p = p[s]
    })
  })
  files.forEach(item => {
    let pathStr = item.path.split('/')
    let len = pathStr.length
    var n = directory

    pathStr.forEach((f, idx) => {
      if (idx === len - 1) {        
        n._contents.push({ name: pathStr[len - 1], path: item.path })
      } else {
        n = n[f]        
      }
    })
  })

  return directory
}

export function parseFileArray (fileArray) {
  let directory = { _contents: [] }

  fileArray.forEach(item => {
    let pathStr = item.path.split('/')
    let len = pathStr.length
    var n = directory

    pathStr.forEach((f, idx) => {
      if (idx === len - 1) {        
        n._contents.push({ name: pathStr[len - 1], path: item.path })
      } else {
        if (!n[f]) {
          n[f] = { _contents: [] }
        }
        n = n[f]        
      }
    })
  })
  return directory
}

export function notTextFile (filename) {
  return /\.(jpeg|png|jpg|gif|ico|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/.test(filename)
}

export function isImageFile (filename) {
  return /\.(jpeg|png|jpg|gif)(\?[a-z0-9]+)?$/.test(filename)
}

export function parseFilePathByLang (filePath) {
  const LANGUAGES = ['en']
  let pathArray = filePath.split('/')
  let len = pathArray.length
  let translations = {}
  LANGUAGES.forEach(lang => {
    if (len >= 2 && pathArray[pathArray.length - 2] === lang) {
      pathArray.splice(pathArray.length - 2, 1)
      translations['cn'] = pathArray.join('/')
    } else {
      pathArray.splice(pathArray.length - 1, 0 , lang)
      translations[lang] = pathArray.join('/')
    }
  })
  return translations
}
