import {take, takeEvery, call, apply, fork, select} from 'redux-saga/effects'
import {push} from 'react-router-redux'
import {delay} from 'redux-saga'
import $dispatch from '~/utils/saga-dispatch'

import * as Actions from '~/actions'
import {getConnection} from '~/connection'
import ProjectContract from '~/contract'
import sel from '~/selectors'

import {$callAPIMethod, $watchTx, assertTxSucceeded} from './api-utils'
import {PENDING_TX_TIMEOUT_MINUTES, REQUIRE_NUM_TX_CONFIRMATIONS} from '~/constants'


export default function* $apiSaga() {
  yield fork($setAccount)

  yield takeEvery(Actions.fetchContract.type, $handleFetchContract)
  yield takeEvery(Actions.createContract.type, $handleCreateContract)

  yield takeEvery(Actions.startContract.type, wrapApiHandler($handleStartContract))
  yield takeEvery(Actions.setBillableTime.type, wrapApiHandler($handleSetBillableTime))
  yield takeEvery(Actions.approve.type, wrapApiHandler($handleApprove))
  yield takeEvery(Actions.withdraw.type, wrapApiHandler($handleWithdraw))
  yield takeEvery(Actions.cancel.type, wrapApiHandler($handleCancel))
  yield takeEvery(Actions.leaveFeedback.type, wrapApiHandler($handleLeaveFeedback))
}


function* $setAccount() {
  let conn
  try {
    conn = yield call(getConnection)
    yield delay(1000)
  } catch (err) {
    console.error(`Failed to connect to the network: ${err.message}`)
    yield* $dispatch(Actions.failedToConnect(err.message))
    return
  }
  yield* $dispatch(Actions.connected(conn.networkId, conn.account || null))
}


let contractsByAddress = {}


function* $handleFetchContract(action) {
  let contract = contractsByAddress[action.address]
  try {
    if (contract) {
      yield apply(contract, contract.fetch)
    } else {
      contract = yield apply(ProjectContract, ProjectContract.at, [action.address])
      contractsByAddress[contract.address] = contract
    }
  } catch (err) {
    yield* $dispatch(Actions.contractOperationFailed(action.address, err.message, !contract))
    // setTimeout(() => {throw err}, 0)
    return
  }
  const contractData = yield select(sel.contractWithAddress, action.address)
  yield* $dispatchUpdateContract(contract, contractData.get('ephemeralAddress'))
}


function* $handleCreateContract(action) {
  yield* $dispatch(push(`/contract/${action.ephemeralAddress}`))

  let contract
  try {
    yield* $dispatch(Actions.contractTxStarted(action.ephemeralAddress, null))

    contract = yield call(ProjectContract.deploy,
      action.name,
      action.clientAddress,
      action.hourlyRate,
      action.timeCapMinutes,
      action.prepayFractionThousands,
    )

    const receipt = yield call($watchTx, contract.connection.web3.eth,
      action.ephemeralAddress, contract.transactionHash,
      PENDING_TX_TIMEOUT_MINUTES, REQUIRE_NUM_TX_CONFIRMATIONS,
      Date.now())

    assertTxSucceeded(receipt)
    yield apply(contract, contract.initialize)
  }
  catch (err) {
    yield* $dispatch(Actions.contractOperationFailed(action.ephemeralAddress, err.message, true))
    setTimeout(() => {throw err}, 0)
    return
  }
  finally {
    yield* $dispatch(Actions.contractTxFinished(action.ephemeralAddress))
  }

  contractsByAddress[contract.address] = contract

  yield* $dispatchUpdateContract(contract, action.ephemeralAddress)
  yield* $dispatch(push(`/contract/${contract.address}`))
}


function* $handleStartContract(action, contract) {
  yield* $callAPIMethod(contract, 'start')
}


function* $handleSetBillableTime(action, contract) {
  yield* $callAPIMethod(contract, 'setBillableTime', [
    60 * Number(action.hours),
    action.comment,
  ])
}


function* $handleApprove(action, contract) {
  yield* $callAPIMethod(contract, 'approve')
}


function* $handleWithdraw(action, contract) {
  yield* $callAPIMethod(contract, 'withdraw')
}


function* $handleCancel(action, contract) {
  yield* $callAPIMethod(contract, 'cancel')
}


function* $handleLeaveFeedback(action, contract) {
  yield* $callAPIMethod(contract, 'leaveFeedback', [action.positive, action.comment])
}


// Utils


function wrapApiHandler($handler) {
  return function* $wrappedHandler(action) {
    const contract = contractsByAddress[action.address]
    if (!contract) {
      console.error(`Contract with address ${action.address} is not found ` +
        `in list (handling action ${action.type})`)
      return
    }
    try {
      yield* $handler(action, contract)
    } catch (err) {
      console.error(`Failed to handle action ${action.type} ` +
        `for contract ${action.address}: ${err.message}`)
      return
    }
    yield* $dispatchUpdateContract(contract)
  }
}


function* $dispatchUpdateContract(contract, ephemeralAddress) {
  yield* $dispatch(Actions.updateContract(contract.serialize(), ephemeralAddress))
}
