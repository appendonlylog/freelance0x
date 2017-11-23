import React from 'react'
import styled from 'styled-components'
import {Link} from 'react-router-dom'

import ContractStateIndicator from './contract-state-indicator'


const Item = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;

  border-top: 1px solid #E0E0E0;
  padding: 24px 30px;
  box-sizing: border-box;

  &:hover {
    background: #5E69D7;
    color: #FFFFFF;
  }
`

const Name = styled.div`
  font-family: 'Proxima Nova';
  font-size: 16px;
  font-weight: 100;
  width: 55%;
`

const ExecutionDate = styled.div`
  font-family: 'Proxima Nova';
  font-size: 16px;
  font-weight: 100;
  width: 25%;
  color: #7C7C7C;

  ${Item}:hover & {
    color: #FFFFFF;
  }
`

const StatusWrapper = styled.div`
  width: 20%;
`


export default function ContractsListItem({contract}) {
  const address = contract.ephemeralAddress || contract.address

  const lastActivityDate = contract.lastActivityDate && (new Date(contract.lastActivityDate * 1000)
    .toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}))

  return (
    <Link to={`/contract/${address}`}>
      <Item>
        <Name>{contract.name}</Name>
        {lastActivityDate ? <ExecutionDate>{lastActivityDate}</ExecutionDate> : null}
        <StatusWrapper>
          <ContractStateIndicator contract={contract} />
        </StatusWrapper>
      </Item>
    </Link>
   )
}
