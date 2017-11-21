import {List, Map, fromJS} from 'immutable'
import * as Actions from '~/actions'

import {State as ContractState} from '~/contract'
import mapValues from '~/utils/map-values'


const INITIAL_STATE = contractsReducer.INITIAL_STATE = Map()


export default function contractsReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case Actions.setContractsList.type: {
      const contractsByAddress = mapValues(action.contractsByAddress,
        contract => ({...contract, updating: true}))
      return state.merge(contractsByAddress)
    }
    case Actions.fetchContract.type: {
      return (state.get(action.address)
        ? state.setIn([action.address, 'updating'], true)
        : state.set(action.address, Map({
          address: action.address,
          state: ContractState.Fetching,
          lastActivityDate: action.now,
          updating: true,
        }))
      )
    }
    case Actions.createContract.type: {
      return state.set(action.ephemeralAddress, Map({
        name: action.name,
        state: ContractState.Creating,
        lastActivityDate: action.now,
        ephemeralAddress: action.ephemeralAddress,
        updating: true,
      }))
    }
    case Actions.contractTxStarted.type: {
      return state.update(action.address, contract => contract.merge({
        updating: true,
        pendingTx: {
          hash: action.txHash,
          confirmations: null,
        }
      }))
    }
    case Actions.contractTxFinalityChanged.type: {
      return state.setIn([action.address, 'pendingTx', 'confirmations'], action.numConfirmations)
    }
    case Actions.contractTxFinished.type: {
      return state.deleteIn([action.address, 'pendingTx'])
    }
    case Actions.contractOperationFailed.type: {
      return state.update(action.address, contract => {
        const newProps = {
          error: action.errorMessage,
          updating: false,
        }
        if (action.contractNotFound) {
          newProps.state = ContractState.NotFound
          newProps.lastActivityDate = 0
        }
        return contract.merge(newProps)
      })
    }
    case Actions.updateContract.type: {
      const {address} = action.contract
      if (action.ephemeralAddress) {
        state = state.delete(action.ephemeralAddress)
      }
      const pendingTx = state.getIn([address, 'pendingTx'])
      let newState = fromJS(action.contract)
      if (pendingTx) {
        newState = newState.merge({pendingTx, updating: true})
      }
      return state.set(address, newState)
    }
  }
  return state
}
