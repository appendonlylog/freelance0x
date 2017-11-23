import React from 'react'
import styled, {css} from 'styled-components'
import Spinner from 'react-spinkit'

import {State} from '~/contract'

import ContractHeader from './contract-header'
import ContractProgress from './contract-progress'
import ContractFooter from './contract-footer'
import ContractFeedback from './contract-feedback'


export default function ContractDetails(props) {
  const errorText = getErrorText(props)
  if (errorText) {
    return renderErrorMessage(errorText)
  }
  if (props.updating) {
    return renderOngoingOperation(props)
  }
  return renderContractDetails(props)
}


function renderErrorMessage(errorText) {
  return (
    <ErrorMessageWrapper>
      <span>😢</span>
      {errorText}
    </ErrorMessageWrapper>
  )
}


function renderOngoingOperation(props) {
  return (
    <SpinnerWrapper>
      <Spinner name='double-bounce' color='#5E69D7' />
    </SpinnerWrapper>
  )
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


const ErrorMessageWrapper = styled.div`
  ${commonWrapperStyles}
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;

  font-family: 'Muller';
  font-weight: 500;
  font-size: 26px;
  color: #242737;
  letter-spacing: -0.79px;

  flex-flow: column nowrap;

  span {
    font-family: 'Apple Color Emoji';
    font-size: 64px;
    margin-bottom: 24px;
  }
`
