import React from 'react'
import styled from 'styled-components'

import ContractStateIndicator from './contract-state-indicator'
import toChecksumAddress from '~/utils/to-checksum-address'

export default class ContractHeader extends React.Component {
  render() {
    let {
      name,
      state,
      clientAddress,
      contractorAddress,
      hourlyRate,
      timeCapMinutes,
      prepayFraction,
      minutesReported
    } = this.props

    return (
      <Inner>
        <Header>{name}
          <ContractStateIndicator contract={{...this.props}} />
        </Header>
        <Separator />
        <FormDescription>
          <Wallets>
            <Address>
              CONTRACTOR
              <a href={addressLink(contractorAddress)} target='_blank'>
                {toChecksumAddress(contractorAddress)}
              </a>
            </Address>
            <Address>
              CLIENT
              <a href={addressLink(clientAddress)} target='_blank'>
                {toChecksumAddress(clientAddress)}
              </a>
            </Address>
          </Wallets>
          <Payment>
            <Rate>
              HOURLY RATE
              <span>
                <ETHIcon>Ξ</ETHIcon>
                {Number(hourlyRate) / Math.pow(10, 18)}
              </span>
            </Rate>
            <Prepayment>
              PREPAYMENT
                <span>{`${Math.floor(Number(prepayFraction) * 100)}`}%</span>
            </Prepayment>
          </Payment>
          <Total>
            PRICE CAP
              <span><ETHIcon>Ξ</ETHIcon> {Number(hourlyRate) / Math.pow(10, 18) * (Number(timeCapMinutes) / 60)}</span>
          </Total>
        </FormDescription>
      </Inner>
    )
  }
}


function addressLink(address) {
  return `https://etherscan.io/address/${address}`
}


const Header = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  font-family: 'Muller';
  font-weight: 500;
  color: #242737;
  font-size: 28px;
  align-self: left;
`

const Separator = styled.div`
  content: '';
  display: block;
  width: 70px;
  height: 2px;
  border-radius: 3px;
  background: #5E69D7;
  margin-top: 24px;
  margin-bottom: 32px;

  letter-spacing: 0.76px;
`

const FormDescription = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  text-align: left;
  margin-bottom: 6px;
  font-size: 16px;
`

const Address = styled.div`
  font-family: 'Muller';
  font-weight: 600;
  font-size: 16px;

  &:last-child {
    margin-top: 24px;
  }

  a {
    display: block;
    margin-top: 8px;
    font-family: 'Proxima Nova';
    font-weight: 400;
  }
`

const InputsContainer = styled.div`
  display: flex;
  jusstify-content: space-between;
`
const Wallets = styled.div`
  width: 70%;
`

const Payment = styled.div`
  width: 30%;
`

const Rate = styled.div`
  font-family: 'Muller';
  font-weight: 600;
  font-size: 16px;

  span {
    font-weight: 400;
    font-family: 'Proxima Nova';
    margin-top: 8px;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }
`

const ETHIcon = styled.div`
  font-family: 'Arial';
  margin-right: 8px;
`

const Prepayment = styled.div`
  font-family: 'Muller';
  font-weight: 600;
  font-size: 16px;
  margin-top: 24px;

  span {
    font-family: 'Proxima Nova';
    font-weight: 400;
    display: block;
    margin-top: 8px;
  }
`

const Total = styled.div`
  font-family: 'Muller';
  font-weight: 600;
  font-size: 16px;
  margin-top: 24px;

  span {
    font-family: 'Proxima Nova';
    font-weight: 400;
    display: block;
    margin-top: 8px;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }
`

const Inner = styled.div`

`
