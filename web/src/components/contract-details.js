import React from 'react'
import styled, {css} from 'styled-components'
import Spinner from 'react-spinkit'

import {State} from '~/contract'

import ContractError from './contract-error'
import ContractHeader from './contract-header'
import ContractProgress from './contract-progress'
import ContractFooter from './contract-footer'
import ContractFeedback from './contract-feedback'


export default function ContractDetails(props) {
  const errorText = getErrorText(props)
  if (errorText) {
    return <ContractError title={errorText} />
  }
  if (props.updating || props.pendingTx) {
    return renderOngoingOperation(props)
  }
  return renderContractDetails(props)
}


function renderOngoingOperation(props) {
  const progressComment = getOngoingOperationDescription(props)
  return (
    <SpinnerWrapper>
      <Spinner name='double-bounce' color='#5E69D7' fadeIn='none' />
      <ProgressWrapper>{progressComment}</ProgressWrapper>
    </SpinnerWrapper>
  )
}


function getOngoingOperationDescription({pendingTx, requireNumTxConfirmations}) {
  if (!pendingTx) {
    return `Updating...`
  }
  if (!pendingTx.hash) {
    return `Sending transaction...`
  }
  if (pendingTx.confirmations == null) {
    return `Waiting for transaction to be mined...`
  }
  return `Confirming transaction (${pendingTx.confirmations}/${requireNumTxConfirmations} confirmations)...`
}


function renderContractDetails(props) {
  return (
    <ContractDetailsWrapper>
      <ContractHeader {...props} />
      {props.state !== State.Created && <ContractProgress {...props} />}
      <ContractFooter {...props} />
    </ContractDetailsWrapper>
  )
}


function getErrorText({state, ephemeralAddress}) {
  return (state == State.NotFound
    ? ephemeralAddress
      ? 'Error occurred while creating the contract'
      : 'Contract Not Found'
    : null
  )
}


const commonWrapperStyles = css`
  flex: 1;
  padding: 60px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`


const ContractDetailsWrapper = styled.div`
  ${commonWrapperStyles}

`


const SpinnerWrapper = styled.div`
  ${commonWrapperStyles}
  height: 480px;
  align-items: center;
  justify-content: center;
`


const ProgressWrapper = styled.div`
  font-weight: 600;
  color: #333;
  margin-top: 15px;
`
