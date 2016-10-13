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