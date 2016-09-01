export function parseSchemas(rawSchemas) {
  return rawSchemas.map(d => ({
    name: d.name.replace('.json', ''),
    url: d.url
  }))
}
