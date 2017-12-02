import React from 'react'
import styled, { css } from 'styled-components'

import {State, Role} from '~/contract'

import Button from './button'

export default class ContractFooter extends React.Component {
  renderPendingFooter () {
    if (this.props.myRole === Role.Client) {
      return (
        <NewContractBtn onClick={() => this.props.actions.startContract(this.props.address)}>
          Join and hold payment
        </NewContractBtn>
      )
    }

    if (this.props.myRole === Role.Contractor) {
      return (
        <StateOneMessage>
          Please send this link to client and ask him to join: <br/>
          <a href={window.location} target='_blank'>{makeContractLink()}</a>
        </StateOneMessage>
      )
    }

    return null
  }


  renderActiveFooter () {
    if (this.props.myRole === Role.Client) {
      return (
        <Footer>
          <ButtonsWrapper>
            <Button onClick={() => this.props.actions.approve(this.props.address)}>APPROVE CONTRACT</Button>
            <Button thin onClick={() => this.props.actions.cancel(this.props.address)}>CANCEL CONTRACT</Button>
          </ButtonsWrapper>
        </Footer>
      )
    }

    if (this.props.myRole === Role.Contractor) {
      return (
        <Footer absolute>
          <ButtonsWrapper absolute>
            <Available>
              <AvailableLabel>AVAILABLE</AvailableLabel>
              <AvailableText>
                <span>Ξ</span>
                {Number(this.props.availableForWithdraw) / Math.pow(10, 18)}
              </AvailableText>
            </Available>
            <Button transparent onClick={() => this.props.actions.withdraw(this.props.address)}>WITHDRAW</Button>
          </ButtonsWrapper>
        </Footer>
      )
    }

    return null
  }

  render () {
    switch (this.props.state) {
      case State.Created: return this.renderPendingFooter()
      case State.Active: return this.renderActiveFooter()
      default: return null
    }
  }
}


function makeContractLink() {
  return String(window.location).replace(/[?]acc(?:ount)?=(\d+)/, '')
}


const ButtonsWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  & > div:nth-child(2) {
    margin-left: 16px;
  }

  ${props => props.absolute && css`
    position: absolute;
    right: 0;
    bottom: 100%;
  `}
`

const Footer = styled.div`
  position: relative;
  margin-top: 32px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;

  ${props => props.absolute && css`
    margin-top: 0;
  `}
`

const Available = styled.div`
  margin-right: 24px;
`

const AvailableLabel = styled.div`
  font-family: 'Muller';
  font-weight: bold;
  font-size: 16px;
  color: #242737;
  letter-spacing: -0.72px;
  margin-bottom: 9px;
`

const AvailableText = styled.div`
  font-family: 'Proxima Nova';
  font-size: 16px;
  color: #242737;
  letter-spacing: -0.48px;

  span {
    font-family: 'Arial';
    margin-right: 8px;
  }
`

const StateOneMessage = styled.div`
  font-family: 'Proxima Nova';
  font-weight: normal;
  margin-top: 60px;
  line-height: 120%;
  a {
    color: #5e69d7;
  }
`

const NewContractBtn = styled.div`
  width: 100%;
  align-self: flex-end;
  padding: 16px 16px 14px;
  margin-top: 20px;
  cursor: pointer;
  box-sizing: border-box;
  text-align: center;
  background-color: #5E69D7;
  color: white;
  text-transform: uppercase;
  border-radius: 3px;

  font-family: 'Muller';
  font-weight: 600;
  font-size: 16px;
  color: #FFFFFF;
  letter-spacing: -0.48px;

  transition: background-color 0.2s ease;

  &:hover {
    background-color: #5964CC;
  }

  &:active {
    background-color: #5660C4;
  }
`
