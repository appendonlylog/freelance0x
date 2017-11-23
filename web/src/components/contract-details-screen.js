import React from 'react'
import styled from 'styled-components'
import {withRouter} from 'react-router-dom'

import connect from '~/utils/connect'
import sel from '~/selectors'
import {State as ContractState, Role as ContractRole} from '~/contract'

import ContractDetails from './contract-details'


export class ContractDetailsScreen extends React.Component {

  static mapStateToProps = (state, props) => {
    const {address} = props.match.params
    return {
      contract: sel.contractWithAddress(state, address),
      initialFetchComplete: sel.initialFetchComplete(state),
    }
  }

  componentWillMount() {
    this.fetchContractIfNeeded(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.fetchContractIfNeeded(nextProps)
  }

  fetchContractIfNeeded(props) {
    const {address} = props.match.params
    if (props.initialFetchComplete && !props.contract && address.substr(0, 2) == '0x') {
      props.actions.fetchContract(address)
    }
  }

  render() {
    const {contract: immutableContract, actions} = this.props

    if (!immutableContract) {
      return null
    }

    const contract = immutableContract.toJS()

    return <ContractDetails {...contract} actions={this.props.actions} />
  }
}


export default connect(ContractDetailsScreen)
