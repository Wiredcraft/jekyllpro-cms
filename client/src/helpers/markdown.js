import yaml from 'js-yaml'


export function parseYamlInsideMarkdown(text) {
  const splitter = '---'
  const targetLines = text.split('\n')
  const indexes = []
  const lineCount = targetLines.length
  for (let i = 0; i < lineCount; i++) {
    if (targetLines[i] === splitter) indexes.push(i)
  }
  if (indexes.length > 1) {
    let text = ''
    for (let i = indexes[0] + 1; i < indexes[1]; i++) {
      text += targetLines[i] + '\n'
    }
    const doc = yaml.safeLoad(text)
    return doc
  }
  return null
}
