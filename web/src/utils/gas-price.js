import {httpGet} from '~/utils/http-request'
import {promisifyCall} from '~/utils/promisify'
import getWeb3 from '~/utils/get-web3'


export async function getGasPrice(maxWaitMinutes, minMinedProbability) {
  try {
    const gasPrice = await getRecommendedGasPrice(maxWaitMinutes, minMinedProbability)
    return Math.min(gasPrice, 100000000) // 0.1 Gwei lower limit
  } catch (err) {
    console.warn(`failed to get recommended gas price: ${err.message}`)
    return 1000000000 // 1 Gwei
  }
}


async function getRecommendedGasPrice(maxWaitMinutes, minMinedProbability) {
  let gasPrice = await getEthGasStationRecommendedGasPrice(maxWaitMinutes, minMinedProbability)
  if (!gasPrice) {
    const web3 = await getWeb3()
    gasPrice = await promisifyCall(web3.eth.getGasPrice, web3.eth)
  }
  return Number(gasPrice)
}


async function getEthGasStationRecommendedGasPrice(maxWaitMinutes, minMinedProbability) {
  const predictTable = await getCachedPredictTable()
  return calcEthGasStationRecommendedGasPrice(predictTable, maxWaitMinutes, minMinedProbability)
}


function calcEthGasStationRecommendedGasPrice(predictTable, maxWaitMinutes, minMinedProbability) {
  for (let i = 0; i < predictTable.length; ++i) {
    const item = predictTable[i]
    if (item.expectedTime <= maxWaitMinutes && item.mined_probability >= minMinedProbability) {
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
