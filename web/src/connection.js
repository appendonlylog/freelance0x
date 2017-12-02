import getWeb3 from '~/utils/get-web3'
import {promisifyCall} from '~/utils/promisify'
import history from '~/history'


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
  const [networkId, latestBlock, accounts] = [
    await promisifyCall(web3.version.getNetwork, web3.version, []),
    await promisifyCall(web3.eth.getBlock, web3.eth, ['latest']),
    await promisifyCall(web3.eth.getAccounts, web3.eth),
  ]
  const blockGasLimit = latestBlock.gasLimit
  const account = accounts[accountIndex]
  return {web3, networkId, blockGasLimit, account}
}


function detectAccountIndex() {
  const match = /[?]acc(?:ount)?=(\d+)/.exec(history.location.search)
  return (match && match[1]) ? +match[1] : 0
}
