import {take, takeEvery, call, apply, fork, select} from 'redux-saga/effects'
import {delay} from 'redux-saga'
import $dispatch from '~/utils/saga-dispatch'

import * as Actions from '~/actions'
import {promisifyCall} from '~/utils/promisify'

import {PENDING_TX_TIMEOUT_MINUTES, REQUIRE_NUM_TX_CONFIRMATIONS} from '~/constants'

const POLLING_DELAY_MS = 1000


export function* $callAPIMethod(contract, methodName, args) {
  console.debug(`[api-utils] {$callAPIMethod} calling ${methodName} on ${contract.address}`)
  let txHash = null
  yield* $dispatch(Actions.contractTxStarted(contract.address, null))
  try {
    txHash = yield apply(contract, methodName, args)
    console.debug(`[api-utils] {$callAPIMethod} txHash: ${txHash}`)
    const receipt = yield call($watchTx, contract.connection.web3.eth, contract.address, txHash,
      PENDING_TX_TIMEOUT_MINUTES, REQUIRE_NUM_TX_CONFIRMATIONS,
      Date.now())
    console.debug(`[api-utils] {$callAPIMethod} receipt:`, receipt)
    assertTxSucceeded(receipt)
    yield apply(contract, contract.fetch)
  } catch (err) {
    setTimeout(() => {throw err}, 0)
    yield* $dispatch(Actions.contractOperationFailed(contract.address, err.message))
  } finally {
    if (txHash) {
      yield* $dispatch(Actions.contractTxFinished(contract.address))
    }
  }
}


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


export function assertTxSucceeded(receipt) {
  if (!checkTxSucceeded(receipt)) {
    throw new Error('transaction rejected')
  }
}


export function checkTxSucceeded(receipt) {
  return Number(receipt.status) === 1
}
