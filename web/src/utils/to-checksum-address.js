import createKeccakHash from 'keccak'

export default function toChecksumAddress(address) {
  address = address.toLowerCase().replace('0x', '')

  const hash = createKeccakHash('keccak256').update(address).digest('hex')
  let ret = '0x'

  for (let i = 0; i < address.length; i++) {
    ret += parseInt(hash[i], 16) >= 8 ? address[i].toUpperCase() : address[i]
  }

  return ret
}
