import React from 'react'
import {Route, Redirect} from 'react-router-dom'

import EthereumAddress from 'ethereum-address'
import toChecksumAddress from '~/utils/to-checksum-address'
import {isEphemeralAddress} from '~/utils/ephemeral-address'

import ContractError from './contract-error'


// See: https://reacttraining.com/react-router/web/example/auth-workflow
//      https://reacttraining.com/react-router/web/api/Route/render-func
//
export default function ContractRoute({component: Component, ...routeProps}) {
  const render = props => {
    const {address} = props.match.params

    if (isEphemeralAddress(address)) {
      return <Component {...props} />
    }

    if (!address || !EthereumAddress.isAddress(address)) {
      return renderInvalidAddressMessage()
    }

    const checksumAddress = toChecksumAddress(address)
    if (checksumAddress != address) {
      return <Redirect to={{
        pathname: routeProps.path.replace(':address', checksumAddress),
        state: {from: props.location}
      }} />
    }

    return <Component {...props} />
  }
  return <Route {...routeProps} render={render} />
}


function renderInvalidAddressMessage() {
  return <ContractError
    title='Invalid contract address'
    details="The Ethereum contract address in this link doesn't seem to be valid."
  />
}
