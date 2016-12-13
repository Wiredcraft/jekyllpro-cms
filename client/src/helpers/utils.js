import { diffChars } from 'diff/lib/diff/character'

export function textValueIsDifferent (origin, other) {
  let diff = diffChars(origin, other)
  return diff.some(d => {
    return (d.added || d.removed)
  })
}

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

// i.e filepath '_products/en/some_folder/msr.md' will be parsed to
// 'en'
//
// LANGUAGES should be in format:
// [{name: 'English', code: 'en'}, {name: 'Chinese', code: 'cn'}],
// THE first one is default site language.
export function parseFilePathByLang (filePath, LANGUAGES) {
  let pathArray = filePath.split('/').filter((f) => { return !!f })
  let lang = null

  // get language code if any
  if (LANGUAGES) {
    let possibleCode = pathArray[0]

    let matched = LANGUAGES.filter(item => {
      return possibleCode === item.code
    })
    if (matched[0]) {
      lang = matched[0].code

    } else {
      lang = LANGUAGES[0].code
    }
  }

  return lang
}

// i.e filepath '_products/en/some_folder/msr.md' will be parsed to
// {lang: 'en', fileExt: 'md', fileSlug: 'some_folder/msr'}
//
// LANGUAGES should be in format:
// [{name: 'English', code: 'en'}, {name: 'Chinese', code: 'cn'}],
// THE first one is default site language.
export function parseFilePath (filePath, LANGUAGES, rootFolder) {
  // slice out root folder
  if (rootFolder && rootFolder !== '/') {
    let idx = filePath.indexOf(rootFolder) + rootFolder.length
    filePath = filePath.slice(idx)
  }

  let pathArray = filePath.split('/').filter((f) => { return !!f })
  let parsedObj = {}

  // get language code if any
  if (LANGUAGES) {
    let possibleCode = pathArray[0]

    let matched = LANGUAGES.filter(item => {
      return possibleCode === item.code
    })
    if (matched[0]) {
      parsedObj['lang'] = matched[0].code
      // shift out language
      pathArray.shift()
    } else {
      parsedObj['lang'] = LANGUAGES[0].code
    }
  }

  // get file extension
  let len = pathArray[pathArray.length - 1]
  let filenames = pathArray[pathArray.length - 1].split('.')

  switch (filenames[filenames.length - 1]) {
    case 'md':
    case 'MD':
      parsedObj['fileExt'] = 'md'
      filenames.pop()
      pathArray[pathArray.length - 1] = filenames.join('')
      break
    case 'html':
    case 'HTML':
      parsedObj['fileExt'] = 'html'
      filenames.pop()
      pathArray[pathArray.length - 1] = filenames.join('')
      break
    default:
      break
  }
  parsedObj['fileSlug'] = pathArray.join('/')

  return parsedObj
}
