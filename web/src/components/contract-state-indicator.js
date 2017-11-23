import React from 'react'
import styled from 'styled-components'
import {Link} from 'react-router-dom'

import connect from '~/utils/connect'
import sel from '~/selectors'
import {State} from '~/contract'


const IndicatorContainer = styled.div`
  font-family: 'Proxima Nova';
  font-size: 16px;
  font-weight: 100;
  text-transform: uppercase;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`

const Circle = styled.div`
  background-color: ${props => getStateColor(props.state)};
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
`

export default function ContractStateIndicator({contract}) {
  return <IndicatorContainer>
    <Circle state={contract.state} />&nbsp;
    {getStateName(contract)}
  </IndicatorContainer>
}


function getStateName(contract) {
  switch (contract.state) {
    case State.NotFound: return contract.ephemeralAddress ? 'Error' : 'Not found'
    case State.Fetching: return 'Fetching'
    case State.Creating: return 'Creating'
    case State.Created: return 'Pending'
    case State.Active: return 'Active'
    case State.Approved: return 'Completed'
    case State.Cancelled: return 'Cancelled'
    default: return 'Error'
  }
}


function getStateColor(state) {
  switch (state) {
    case State.Created: return '#FFE53A'
    case State.Active: return '#8AE7B0'
    case State.Approved: return '#8AA0E7'
    case State.Cancelled: return '#f67055'
    default: return '#d6d6d6'
  }
}
