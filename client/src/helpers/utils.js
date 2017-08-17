import { diffChars } from 'diff/lib/diff/character';
import tinytime from 'tinytime';
import slug from 'speakingurl';
const timeTemplate = tinytime('{YYYY}-{Mo}-{DD}', {
  padMonth: true,
  padDays: true
});

export function textValueIsDifferent(origin, other) {
  let diff = diffChars(origin, other);
  return diff.some(d => {
    return d.added || d.removed;
  });
}

export function dateToString(dateObj) {
  return timeTemplate.render(dateObj);
}

export function slugify(value, dateString = dateToString(new Date())) {
  // TODO simple slugify
  // return dateString + '-' + value.toLowerCase().trim()
  //   .replace(/[^\w\d\s-]/g, '')
  //   .replace(/\s+/g, '-');
  return dateString + '-' + slug(value, { tone: false });
}

export function parseFileDate(filename) {
  // TODO mayby specify word boundary or start of line
  const dateCapture = filename.match(/(\d{4}-\d{1,2}-\d{1,2})/);
  if (dateCapture) {
    return dateCapture[0];
  }
}

export function purgeObject(obj) {
  Object.keys(obj).forEach(prop => {
    if (obj[prop] === undefined) {
      delete obj[prop];
    }
  });
}

export function parseFileTree(treeArray) {
  let directory = { _contents: [] };

  let files = treeArray.filter(item => {
    return item.type === 'blob';
  });
  let folders = treeArray.filter(item => {
    return item.type === 'tree';
  });
  folders.forEach(item => {
    let pathStr = item.path.split('/');
    var p = directory;
    pathStr.forEach(s => {
      if (!p[s]) {
        p[s] = { _contents: [] };
      }
      p = p[s];
    });
  });
  files.forEach(item => {
    let pathStr = item.path.split('/');
    let len = pathStr.length;
    var n = directory;

    pathStr.forEach((f, idx) => {
      if (idx === len - 1) {
        n._contents.push({ name: pathStr[len - 1], path: item.path });
      } else {
        n = n[f];
      }
    });
  });

  return directory;
}

export function parseFileArray(fileArray) {
  let directory = { _contents: [] };

  fileArray.forEach(item => {
    let pathStr = item.path.split('/');
    let len = pathStr.length;
    var n = directory;

    pathStr.forEach((f, idx) => {
      if (idx === len - 1) {
        n._contents.push({ name: pathStr[len - 1], path: item.path });
      } else {
        if (!n[f]) {
          n[f] = { _contents: [] };
        }
        n = n[f];
      }
    });
  });
  return directory;
}

// '/folder0/folder1/folder2' will be processed to
// [
// {name: 'folder0', pathArray: ['folder0']},
// {name: 'folder1', pathArray: ['folder0', 'folder1']},
// {name: 'folder2', pathArray: ['folder0', 'folder1', 'folder2']}
// ]
export function parseFolderPath(folderPath) {
  return folderPath
    .split('/')
    .filter(p => {
      return !!p;
    })
    .map(function(item, index, array) {
      return {
        name: item,
        pathArray: array.slice(0, index + 1)
      };
    });
}

export function parseFolderObj(folderPath, directoryObj) {
  if (folderPath === '/') {
    return directoryObj;
  }

  return folderPath
    .split('/')
    .filter(p => {
      return !!p;
    })
    .reduce(function(pre, cur) {
      return pre[cur];
    }, directoryObj);
}

export function notTextFile(filename) {
  return /\.(jpeg|png|jpg|gif|ico|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/.test(
    filename
  );
}

export function isImageFile(filename) {
  return /\.(jpeg|png|jpg|gif)(\?[a-z0-9]+)?$/.test(filename);
}

// i.e filepath '_products/en/some_folder/msr.md' will be parsed to
// 'en'
//
// LANGUAGES should be in format:
// [{name: 'English', code: 'en'}, {name: 'Chinese', code: 'cn'}],
// THE first one is default site language.
export function parseFilePathByLang(filePath, LANGUAGES, rootFolder) {
  let lang = null;
  // slice out root folder
  if (rootFolder && rootFolder !== '/') {
    let idx = filePath.indexOf(rootFolder) + rootFolder.length;
    filePath = filePath.slice(idx);
  }

  let pathArray = filePath.split('/').filter(f => {
    return !!f;
  });

  // get language code if any
  if (LANGUAGES) {
    let possibleCode = pathArray[0];

    let matched = LANGUAGES.filter(item => {
      if (rootFolder) {
        return pathArray[0] === item.code;
      }
      return pathArray.indexOf(item.code) > -1;
    });
    if (matched[0]) {
      lang = matched[0].code;
    } else {
      lang = LANGUAGES[0].code;
    }
  }

  return lang;
}

/**
 * parse filepath
 *
 * input filePath = '_products/en/path0/path1/2017-05-25-msr.md'
 * will produce:
 *  {
 *    lang: 'en',
 *    fileExt: 'md',
 *    subPath: 'paht0/path1',
 *    fileSlug: '2017-05-25-msr',
 *    fileDate: '2017-05-25'
 *  }
 *
 * LANGUAGES should be in format:
 * [{name: 'English', code: 'en'}, {name: 'Chinese', code: 'cn'}],
 * The first one is default site language.
 */
export function parseFilePath(filePath, LANGUAGES, rootFolder) {
  // slice out root folder
  if (rootFolder && rootFolder !== '/') {
    let idx = filePath.indexOf(rootFolder) + rootFolder.length;
    filePath = filePath.slice(idx);
  }

  let pathArray = filePath.split('/').filter(f => {
    return !!f;
  });
  let parsedObj = {};

  // get language code if any
  if (LANGUAGES) {
    let possibleCode = pathArray[0];

    let matched = LANGUAGES.filter(item => {
      return possibleCode === item.code;
    });
    if (matched[0]) {
      parsedObj['lang'] = matched[0].code;
      // shift out language
      pathArray.shift();
    } else {
      parsedObj['lang'] = LANGUAGES[0].code;
    }
  }

  // get file extension
  let len = pathArray[pathArray.length - 1];
  let filenames = pathArray[pathArray.length - 1].split('.');

  const fileDate = parseFileDate(filenames[0]);

  switch (filenames[filenames.length - 1]) {
    case 'md':
    case 'MD':
      parsedObj['fileExt'] = 'md';
      filenames.pop();
      pathArray[pathArray.length - 1] = filenames.join('');
      break;
    case 'html':
    case 'HTML':
      parsedObj['fileExt'] = 'html';
      filenames.pop();
      pathArray[pathArray.length - 1] = filenames.join('');
      break;
    default:
      break;
  }

  parsedObj['subPath'] = pathArray.slice(0, pathArray.length - 1).join('/');
  parsedObj['fileSlug'] = pathArray[pathArray.length - 1];
  if (fileDate) {
    parsedObj['fileDate'] = fileDate;
  } else {
    parsedObj['fileDate'] = fileDate;
  }

  return parsedObj;
}

export function parseNameFromFilePath(filePath) {
  let arry = filePath.split('/').filter(s => {
    return !!s;
  });

  return arry[arry.length - 1];
}

// converting a url query Object to a search string
export function queryToUrlString(query) {
  var strs = [];
  Object.keys(query).forEach(keyName => {
    strs.push(keyName + '=' + query[keyName]);
  });
  return '?' + strs.join('&');
}

export function getFilenameFromPath(filepath) {
  if (!filepath) return '';

  let idx = filepath.lastIndexOf('/');
  return filepath.slice(idx + 1);
}

// permalink can be "/:category/:title/"
// filepath can be "_posts/en/2000-1-2-erer-dfdf-dfdf.md"
export function getUrlPathByPermalinkRule(filepath, fileContentObj, permalink) {
  let permalinkRules = permalink.replace(/:/g, '').split('/').filter(s => !!s);
  let filename = getFilenameFromPath(filepath);

  return permalinkRules.reduce((accPath, fieldName) => {
    let path = null;
    if (fieldName === 'title') {
      let fileSlug = /^\d{4}-\d{1,2}-\d{1,2}-(.*)\.md|html|markdown$/gi.exec(
        filename
      );
      path = fileSlug ? fileSlug[1] : '';
    } else {
      let fieldVal = fileContentObj[fieldName] || '';
      // it could be array
      path = fieldVal.toString().replace(/,/g, '/');
    }
    return accPath === '' ? path : `${accPath}/${path}`;
  }, '');
}
