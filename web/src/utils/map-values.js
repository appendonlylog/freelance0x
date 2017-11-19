
export default function mapValues(obj, fn) {
  let result = {}
  for (let key in obj) {
    const value = fn(obj[key])
    if (value !== undefined) {
      result[key] = value
    }
  }
  return result
}
