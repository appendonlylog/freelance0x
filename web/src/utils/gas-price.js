import {httpGet} from '~/utils/http-request'
import {promisifyCall} from '~/utils/promisify'
import getWeb3 from '~/utils/get-web3'
import swallowErrors from '~/utils/swallow-errors'


// TODO: don't query ethgas when chainId is not 1


const GWEI = 1000000000
const MIN_GAS_PRICE = 0.2 * GWEI
const MIN_HASHPOWER_ACCEPTING = 20


export async function getGasPrice(maxWaitMinutes) {
  const [web3GasPrice, recommendedGasPrice] = [
    await swallowErrors(getWeb3GasPrice(), 'failed to get gas price from web3'),
    await swallowErrors(getRecommendedGasPrice(maxWaitMinutes), 'failed to get gas price from ethgas'),
  ]
  let gasPrice = recommendedGasPrice
  if (!gasPrice || (web3GasPrice > 0 && web3GasPrice < recommendedGasPrice)) {
    gasPrice = web3GasPrice
  }
  const limitedGasPrice = Math.max(gasPrice, MIN_GAS_PRICE)
  console.debug(`getGasPrice(${maxWaitMinutes}): ` +
    `ethgas ${recommendedGasPrice / GWEI}, ` +
    `web3 ${web3GasPrice / GWEI}, ` +
    `result ${limitedGasPrice / GWEI}`)
  return limitedGasPrice
}


async function getWeb3GasPrice() {
  const web3 = await getWeb3()
  const gasPrice = await promisifyCall(web3.eth.getGasPrice, web3.eth)
  return Number(gasPrice)
}


async function getRecommendedGasPrice(maxWaitMinutes) {
  const predictTable = await getCachedPredictTable()
  return calcEthGasStationRecommendedGasPrice(predictTable, maxWaitMinutes)
}


function calcEthGasStationRecommendedGasPrice(predictTable, maxWaitMinutes) {
  for (let i = 0; i < predictTable.length; ++i) {
    const item = predictTable[i]
    if (item.expectedTime <= maxWaitMinutes && item.hashpower_accepting >= MIN_HASHPOWER_ACCEPTING) {
      return item.gasprice * 1000000000
    }
  }
  return null
}


const CACHE_PREDICT_TABLE_FOR_MS = 1000 * 60 * 5 // 5 minutes


let predictTable = null
let predictTableDate = 0


async function getCachedPredictTable() {
  if (predictTable == null) {
    const predictTableJSON = localStorage.gasPredictTable
    if (predictTableJSON) {
      predictTable = JSON.parse(predictTableJSON)
      predictTableDate = Number(localStorage.gasPredictTableDate)
    }
  }

  if (predictTable && Date.now() - predictTableDate < CACHE_PREDICT_TABLE_FOR_MS) {
    return predictTable
  }

  try {
    predictTable = await httpGet('http://188.166.195.71/predictTable')
  } catch (err) {
    console.warn(`failed to query ethgasstation API: ${err.message}`)
    predictTable = []
  }

  // Check for API changes
  const item = predictTable[0] || {}
  if (!(item.gasprice >= 0) || !(item.expectedTime >= 0) || !(item.mined_probability >= 0)) {
    console.warn(`unexpected ethgasstation API response:`, predictTable)
    predictTable = []
  }

  predictTable = predictTable.sort((x, y) => x.gasprice - y.gasprice)
  predictTableDate = Date.now()

  localStorage.gasPredictTable = JSON.stringify(predictTable)
  localStorage.gasPredictTableDate = String(predictTableDate)

  return predictTable
}
