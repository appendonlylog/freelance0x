import {take, takeEvery, call, apply, fork, select} from 'redux-saga/effects'
import {push} from 'react-router-redux'
import {delay} from 'redux-saga'
import $dispatch from '~/utils/saga-dispatch'

import * as Actions from '~/actions'
import toChecksumAddress from '~/utils/to-checksum-address'
import {getConnection} from '~/connection'
import ProjectContract from '~/contract'
import sel from '~/selectors'

import {$watchTx} from './api-utils'
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
    const [_conn, _] = [
      yield call(getConnection),
      yield delay(500),
    ]
    conn = _conn
  } catch (err) {
    console.error(`Failed to connect to the network: ${err.message}`)
    yield* $dispatch(Actions.failedToConnect(err.message))
    return
  }
  yield* $dispatch(Actions.connected(conn.networkId, conn.account || null))
}


let contractsByAddress = {}


function getContractInstance(address) {
  return contractsByAddress[String(address).toLowerCase()]
}


function storeContractInstance(contract) {
  return contractsByAddress[contract.address.toLowerCase()] = contract
}


function* $handleFetchContract(action) {
  const contractData = yield select(sel.contractWithAddress, action.address)
  if (contractData.get('updating')) {
    return
  }
  yield* $runContractOperation(true, action.address, $fetchContract, contractData)
}


function* $fetchContract(contractAddress, contractData) {
  yield* $dispatch(Actions.startedUpdatingContract(contractAddress))

  const txHash = contractData.getIn(['pendingTx', 'hash'])

  let contract = getContractInstance(contractAddress)
  const noInstance = !contract

  if (noInstance) {
    contract = yield apply(ProjectContract, ProjectContract.at, [contractAddress])
    storeContractInstance(contract)
  }

  if (txHash) {
    yield call($watchTx,
      contract.connection.web3.eth, contractAddress, txHash,
      PENDING_TX_TIMEOUT_MINUTES, REQUIRE_NUM_TX_CONFIRMATIONS,
      Date.now()
    )
  }

  if (!noInstance || txHash) {
    yield apply(contract, contract.fetch)
  }
}


function* $callAPIMethod(contract, methodName, args) {
  console.debug(`[api-utils] {$callAPIMethod} calling ${methodName} on ${contract.address}`)
  yield* $runContractOperation(true, contract.address, function* () {
    yield* $dispatch(Actions.contractTxStarted(contract.address, null))
    const txHash = yield apply(contract, methodName, args)
    console.debug(`[api-utils] {$callAPIMethod} txHash: ${txHash}`)
    yield call($watchTx, contract.connection.web3.eth, contract.address, txHash,
      PENDING_TX_TIMEOUT_MINUTES, REQUIRE_NUM_TX_CONFIRMATIONS,
      Date.now())
    console.debug(`[api-utils] {$callAPIMethod} receipt:`, receipt)
    yield apply(contract, contract.fetch)
  })
}


function* $runContractOperation(isTx, contractAddress, $fn, ...args) {
  try {
    yield* $fn(contractAddress, ...args)
    const contract = getContractInstance(contractAddress)
    const contractData = yield select(sel.contractWithAddress, contractAddress)
    yield* $dispatchUpdateContract(contract, contractData.get('ephemeralAddress'))
  } catch (err) {
    const contract = getContractInstance(contractAddress)
    yield* $dispatch(Actions.contractOperationFailed(contractAddress, err.message, !contract))
    setTimeout(() => {throw err}, 0)
  } finally {
    if (isTx) {
      yield* $dispatch(Actions.contractTxFinished(contractAddress))
    }
  }
}


function* $handleCreateContract(action) {
  try {
    yield* $dispatch(push(`/contract/${action.ephemeralAddress}`))
    yield* $dispatch(Actions.contractTxStarted(action.ephemeralAddress, null))

    const contract = yield call(ProjectContract.deploy,
      action.name,
      action.clientAddress,
      action.hourlyRate,
      action.timeCapMinutes,
      action.prepayFractionThousands,
    )

    storeContractInstance(contract)
    yield apply(contract, contract.initialize)

    yield* $dispatchUpdateContract(contract, action.ephemeralAddress)
    yield* $dispatch(push(`/contract/${toChecksumAddress(contract.address)}`))

    yield call($watchTx, contract.connection.web3.eth,
      contract.address, contract.transactionHash,
      PENDING_TX_TIMEOUT_MINUTES, REQUIRE_NUM_TX_CONFIRMATIONS,
      Date.now())

    yield* $dispatchUpdateContract(contract)
  }
  catch (err) {
    yield* $dispatch(Actions.contractOperationFailed(action.ephemeralAddress, err.message, true))
    setTimeout(() => {throw err}, 0)
    return
  }
  finally {
    yield* $dispatch(Actions.contractTxFinished(action.ephemeralAddress))
  }
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
    const contract = getContractInstance(action.address)
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
