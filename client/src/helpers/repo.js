export function parseFilesMeta(rawSchemas) {
  return rawSchemas.map(d => ({
    name: d.name.replace('.json', ''),
    url: d.url
  }))
}
