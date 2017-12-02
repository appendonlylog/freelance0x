
export function makeEphemeralAddress() {
  return 'new-' + Date.now() + '-' + Math.floor(100000 * Math.random())
}


export function isEphemeralAddress(address) {
  return /^new-(?:\d+)-(\d+)$/.test(address)
}
