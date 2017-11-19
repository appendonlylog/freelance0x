import {take, takeEvery, call, apply, fork, select} from 'redux-saga/effects'
import {push} from 'react-router-redux'
import {delay} from 'redux-saga'
import $dispatch from '~/utils/saga-dispatch'

import * as Actions from '~/actions'
import ProjectContract, {getAccount} from '~/contract'
import sel from '~/selectors'

import getWeb3 from '~/utils/get-web3'
import {$callAPIMethod} from './api-utils'


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
  let address
  try {
    address = yield call(getAccount)
    yield delay(1000)
  } catch (err) {
    console.error(`Cannot get account: ${err.message}`)
    yield* $dispatch(Actions.failedToConnect(err.message))
    return
  }
  yield* $dispatch(Actions.connected(address || null))
}


let contractsByAddress = {}


function* $handleFetchContract(action) {
  let contract = contractsByAddress[action.address]
  try {
    if (contract) {
      yield call(contract.fetch)
    } else {
      contract = yield call(ProjectContract.at, action.address)
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
    contract = yield call(ProjectContract.deploy,
      action.name,
      action.clientAddress,
      action.hourlyRate,
      action.timeCapMinutes,
      action.prepayFractionThousands,
    )
  } catch (err) {
    yield* $dispatch(Actions.contractOperationFailed(action.ephemeralAddress, err.message))
    setTimeout(() => {throw err}, 0)
    return
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
