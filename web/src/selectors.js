import {Map, List} from 'immutable'
import {createSelector} from 'reselect'

import makeSelectors from '~/utils/make-selectors'


let sel = makeSelectors({
  connection: 'connection',
  isConnecting: ['connection', 'isConnecting'],
  networkId: ['connection', 'networkId'],
  account: ['connection', 'account'],
  initialFetchComplete: 'initialFetchComplete',
  contracts: 'contracts',
})


sel.isConnected = (state) => {
  return sel.networkId(state) != null
}


sel.hasNoEthereumClientInstalled = (state) => {
  return !sel.isConnecting(state) && !sel.isConnected(state)
}


sel.needsToLogIn = (state) => {
  return sel.isConnected(state) && !sel.account(state)
}


sel.myContracts = createSelector(sel.connection, sel.contracts, (connection, contracts) => {
  const networkId = connection.get('networkId')
  const account = connection.get('account')
  return contracts.filter(contract => {
    return contract.get('ephemeralAddress') != null || (
      contract.get('networkId') == networkId && (
        contract.get('clientAddress') == account ||
        contract.get('contractorAddress') == account
      )
    )
  })
})


sel.contractWithAddress = (state, address) => {
  return sel.contracts(state).get(address)
}


export default sel
