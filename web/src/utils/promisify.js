export default promisify

export function promisify(fn, ctx) {
  const result = function() {
    const args = arguments.length == 1 ? [arguments[0]] : Array.apply(null, arguments)
    return promisifyCall(fn, ctx, args)
  }
  result.name = fn.name
  return result
}


export function promisifyCall(fn, ctx, args = []) {
  return new Promise((resolve, reject) => {
    args.push((err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
    fn.apply(ctx, args)
  })
}
