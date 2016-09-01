export function parseFilesMeta(rawSchemas) {
  return rawSchemas.map(d => ({
    name: d.name.replace('.json', ''),
    path: d.path,
    url: d.url
  }))
}
