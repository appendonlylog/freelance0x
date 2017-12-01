
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
    address,
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
    address,
    txHash,
  }
}

contractTxFinalityChanged.type = 'CONTRACT_TX_FINALITY_CHANGED'

export function contractTxFinalityChanged(address, numConfirmations) {
  return {
    type: contractTxFinalityChanged.type,
    address,
    numConfirmations,
  }
}

contractTxFinished.type = 'CONTRACT_TX_FINISHED'

export function contractTxFinished(address) {
  return {
    type: contractTxFinished.type,
    address,
  }
}

updateContract.type = 'UPDATE_CONTRACT'

export function updateContract(contract, ephemeralAddress) {
  return {
    type: updateContract.type,
    contract,
    ephemeralAddress,
  }
}

fetchContract.type = 'FETCH_CONTRACT'

export function fetchContract(address) {
  return {
    type: fetchContract.type,
    address,
    now: now(),
  }
}

createContract.type = 'CREATE_CONTRACT'

export function createContract(
  name, clientAddress, hourlyRate, timeCapMinutes, prepayFractionThousands
) {
  const ephemeralAddress = 'new-' + Date.now() + '-' + Math.floor(100000 * Math.random())
  return {
    type: createContract.type,
    name,
    clientAddress,
    hourlyRate,
    timeCapMinutes,
    prepayFractionThousands,
    ephemeralAddress,
    now: now(),
  }
}

startedUpdatingContract.type = 'STARTED_UPDATING_CONTRACT'

export function startedUpdatingContract(address) {
  return {
    type: startedUpdatingContract.type,
    address,
  }
}

contractOperationFailed.type = 'CONTRACT_OPERATION_FAILED'

export function contractOperationFailed(address, errorMessage, contractNotFound) {
  return {
    type: contractOperationFailed.type,
    address,
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
    address,
  }
}

setBillableTime.type = 'SET_BILLABLE_TIME'

export function setBillableTime(address, hours, comment) {
  return {
    type: setBillableTime.type,
    address,
    hours,
    comment,
  }
}

approve.type = 'APPROVE'

export function approve(address) {
  return {
    type: approve.type,
    address,
  }
}

withdraw.type = 'WITHDRAW'

export function withdraw(address) {
  return {
    type: withdraw.type,
    address,
  }
}

cancel.type = 'CANCEL'

export function cancel(address) {
  return {
    type: cancel.type,
    address,
  }
}

leaveFeedback.type = 'LEAVE_FEEDBACK'

export function leaveFeedback(address, positive, comment) {
  return {
    type: leaveFeedback.type,
    address,
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
