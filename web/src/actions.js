import {makeEphemeralAddress} from '~/utils/ephemeral-address'

//
// Connection
//

failedToConnect.type = 'FAILED_TO_CONNECT'

export function failedToConnect(errorMessage) {
  return {
    type: failedToConnect.type,
    errorMessage,
  }
}

connected.type = 'CONNECTED'

export function connected(networkId, address) {
  return {
    type: connected.type,
    address: address.toLowerCase(),
    networkId,
  }
}

//
// Contracts state
//

setContractsList.type = 'SET_CONTRACTS_LIST'

export function setContractsList(contractsByAddress) {
  return {
    type: setContractsList.type,
    contractsByAddress,
  }
}

initialFetchCompleted.type = 'INITIAL_FETCH_COMPLETED'

export function initialFetchCompleted() {
  return {
    type: initialFetchCompleted.type,
  }
}

contractTxStarted.type = 'CONTRACT_TX_STARTED'

export function contractTxStarted(address, txHash) {
  return {
    type: contractTxStarted.type,
    address: address.toLowerCase(),
    txHash,
  }
}

contractTxFinalityChanged.type = 'CONTRACT_TX_FINALITY_CHANGED'

export function contractTxFinalityChanged(address, numConfirmations) {
  return {
    type: contractTxFinalityChanged.type,
    address: address.toLowerCase(),
    numConfirmations,
  }
}

contractTxFinished.type = 'CONTRACT_TX_FINISHED'

export function contractTxFinished(address) {
  return {
    type: contractTxFinished.type,
    address: address.toLowerCase(),
  }
}

updateContract.type = 'UPDATE_CONTRACT'

export function updateContract(contract, ephemeralAddress) {
  return {
    type: updateContract.type,
    ephemeralAddress: ephemeralAddress && ephemeralAddress.toLowerCase(),
    contract,
  }
}

fetchContract.type = 'FETCH_CONTRACT'

export function fetchContract(address) {
  return {
    type: fetchContract.type,
    address: address.toLowerCase(),
    now: now(),
  }
}

createContract.type = 'CREATE_CONTRACT'

export function createContract(
  name, clientAddress, hourlyRateEther, timeCapMinutes, prepayFractionThousands
) {
  return {
    type: createContract.type,
    name,
    clientAddress,
    hourlyRateEther,
    timeCapMinutes,
    prepayFractionThousands,
    ephemeralAddress: makeEphemeralAddress(),
    now: now(),
  }
}

startedUpdatingContract.type = 'STARTED_UPDATING_CONTRACT'

export function startedUpdatingContract(address) {
  return {
    type: startedUpdatingContract.type,
    address: address.toLowerCase(),
  }
}

contractOperationFailed.type = 'CONTRACT_OPERATION_FAILED'

export function contractOperationFailed(address, errorMessage, contractNotFound) {
  return {
    type: contractOperationFailed.type,
    address: address.toLowerCase(),
    errorMessage,
    contractNotFound,
  }
}

//
// Contract operations
//

startContract.type = 'START_CONTRACT'

export function startContract(address) {
  return {
    type: startContract.type,
    address: address.toLowerCase(),
  }
}

setBillableTime.type = 'SET_BILLABLE_TIME'

export function setBillableTime(address, hours, comment) {
  return {
    type: setBillableTime.type,
    address: address.toLowerCase(),
    hours,
    comment,
  }
}

approve.type = 'APPROVE'

export function approve(address) {
  return {
    type: approve.type,
    address: address.toLowerCase(),
  }
}

withdraw.type = 'WITHDRAW'

export function withdraw(address) {
  return {
    type: withdraw.type,
    address: address.toLowerCase(),
  }
}

cancel.type = 'CANCEL'

export function cancel(address) {
  return {
    type: cancel.type,
    address: address.toLowerCase(),
  }
}

leaveFeedback.type = 'LEAVE_FEEDBACK'

export function leaveFeedback(address, positive, comment) {
  return {
    type: leaveFeedback.type,
    address: address.toLowerCase(),
    positive,
    comment,
  }
}


//
// Helpers
//


function now() {
  return Math.floor(Date.now() / 1000)
}
