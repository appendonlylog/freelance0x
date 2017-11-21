
export default function swallowErrors(promise, message = null) {
  return promise.catch(err => {
    if (message) {
      console.error(`${message}: ${err.message}`)
    }
    setTimeout(() => {throw err})
  }, 0)
}
