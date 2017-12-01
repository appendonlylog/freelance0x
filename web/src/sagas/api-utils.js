import {take, takeEvery, call, apply, fork, select} from 'redux-saga/effects'
import {delay} from 'redux-saga'
import $dispatch from '~/utils/saga-dispatch'

import * as Actions from '~/actions'
import {promisifyCall} from '~/utils/promisify'


const POLLING_DELAY_MS = 1000


export function* $watchTx(eth, contractAddress, txHash, timeoutMinutes, numConfirmations, startedAt) {
  yield* $dispatch(Actions.contractTxStarted(contractAddress, txHash))

  let receipt

  while (true) {
    if (!receipt) {
      receipt = yield call($waitForTxReceipt, eth, txHash, startedAt, timeoutMinutes)
      console.debug(`[api-utils] {$watchTx} fetched receipt:`, receipt)
    }

    const {blockNumber, blockHash} = receipt
    yield call($waitUntilTxConfirmed, eth, contractAddress, blockNumber, numConfirmations)

    receipt = yield getTransactionReceipt(eth, txHash)
    console.debug(`[api-utils] {$watchTx} fetched updated receipt:`, receipt)

    if (receipt && receipt.blockHash == blockHash && receipt.blockNumber == blockNumber) {
      console.debug(`[api-utils] {$watchTx} updated receipt is consistent`)
      break
    }

    if (!receipt) {
      console.debug(`[api-utils] {$watchTx} sleeping`)
      yield delay(POLLING_DELAY_MS)
    }
  }

  assertTxSucceeded(receipt)
  return receipt
}


function* $waitForTxReceipt(eth, txHash, startedAt, timeoutMinutes) {
  const timeoutMs = timeoutMinutes * 60 * 1000
  while (true) {
    const receipt = yield getTransactionReceipt(eth, txHash)
    if (receipt != null) {
      console.debug(`[api-utils] {$waitForTxReceipt} got receipt`)
      return receipt
    }
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(`transaction was not mined in ${timeoutMinutes} minutes`)
    }
    console.debug(`[api-utils] {$waitForTxReceipt} sleeping`)
    yield delay(POLLING_DELAY_MS)
  }
}


function* $waitUntilTxConfirmed(eth, contractAddress, txBlockNumber, requireNumConfirmations) {
  let prevNumConfirmations
  while (true) {
    const blockNumber = yield getBlockNumber(eth)
    const numConfirmations = blockNumber - txBlockNumber
    if (numConfirmations >= requireNumConfirmations) {
      return
    }
    if (numConfirmations != prevNumConfirmations) {
      yield* $dispatch(Actions.contractTxFinalityChanged(contractAddress, numConfirmations))
      prevNumConfirmations = numConfirmations
    }
    yield delay(POLLING_DELAY_MS)
  }
}


function getTransactionReceipt(eth, txHash) {
  return promisifyCall(eth.getTransactionReceipt, eth, [txHash])
}


function getBlockNumber(eth) {
  return promisifyCall(eth.getBlockNumber, eth, [])
}


function assertTxSucceeded(receipt) {
  if (!checkTxSucceeded(receipt)) {
    throw new Error('transaction rejected')
  }
}


function checkTxSucceeded(receipt) {
  return Number(receipt.status) === 1
}
