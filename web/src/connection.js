import getWeb3 from '~/utils/get-web3'
import {promisifyCall} from '~/utils/promisify'


const connectionPromise = makeConnectionPromise()


export function getConnection() {
  return connectionPromise
}


export async function getAccount() {
  const {account} = await connectionPromise
  return account
}


const accountIndex = detectAccountIndex()


async function makeConnectionPromise() {
  const web3 = await getWeb3()
  const networkId = await promisifyCall(web3.version.getNetwork, web3.version, [])
  const account = web3.eth.accounts[accountIndex]
  return {web3, networkId, account}
}


function detectAccountIndex() {
  const match = /[?]acc(?:ount)?=(\d+)/.exec(window.location.search)
  return (match && match[1]) ? +match[1] : 0
}
