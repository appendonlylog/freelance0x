import React from 'react'
import styled from 'styled-components'
import {Link} from 'react-router-dom'

import connect from '~/utils/connect'
import sel from '~/selectors'

import EthereumAddress from 'ethereum-address'


const Inner = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding: 0 30px;
`

const NewContractForm = styled.form`
  font-family: 'Proxima Nova';
  display: flex;
  flex-direction: column;
  width: 700px;
  height: 600px;
  margin: 100px 0;
  padding: 70px 30px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.1);
`

const NewContractBtn = styled.a`
  display: block;
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
  font-weight: bold;
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

const FormTitle = styled.h2`
  margin-bottom: 16px;
  align-self: center;

  font-family: 'Muller';
  font-weight: 500;
  font-size: 36px;
  color: #242737;
  letter-spacing: -0.38px;

  position: relative;
  padding-bottom: 16px;

  &:after {
    content: '';
    height: 2px;
    width: 70px;
    background: #5E69D7;
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
  }
`

const FormDescription = styled.div`
  text-align: center;
  vertical-align: middle;
  margin-bottom: 32px;
  font-size: 16px;
  color: #6B787D;
`

const Paragraph = styled.p`
  &:first-child {
    margin-bottom: 5px;
  }
`

const InputsContainer = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`

const Input = styled.input`
  display: block;
  margin: 10px 0;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #cccccc;
  color: #242737;

  font-family: 'Proxima Nova';
  font-size: 16px;
  color: #242737;
  letter-spacing: -0.48px;
  line-height: 22px;

  &:focus {
    outline: none;
    border-color: #5E69D7;
  }
`

const ContractorAddress = Input.extend``
const ClientAddress = Input.extend`
  margin-right: 20px;
`
const ContractName = Input.extend``
const HourlyRate = Input.extend`
  margin-right: 20px;
`
const HoursHardCap = Input.extend``
const PrepaymentCurrentValue = Input.extend`
  width: 150px;
  margin-right: 20px;
  text-align: center;
  color: #9B9B9B;
`
const Prepayment = Input.extend`
  cursor: pointer;
`

const PaymentOverlay = styled.div`
  height: 5px;
  background-color: #5E69D7;
  width: 446px;
  position: absolute;
  top: 31px;
  left: 182px;
  border-radius: 2px;
  cursor: pointer;
`

export class NewContractScreen extends React.Component {

  static mapStateToProps(state) {
    return {
      account: sel.account(state),
    }
  }

  componentDidMount = () => {
    this.updateRangeValue()
  }

  render() {
    return (
      <Inner>
        <FormTitle>Deploy Contract</FormTitle>
        <FormDescription>
          <Paragraph>Please set contract details.</Paragraph>
        </FormDescription>
        <InputsContainer>
          <ClientAddress onBlur={this.validateClientAddress} innerRef={node => this.clientAddressInput = node} placeholder='Client Address' />
          <ContractName onBlur={this.validateContractName} innerRef={node => this.contractNameInput = node} placeholder='Contract Name' />
        </InputsContainer>
        <InputsContainer>
          <HourlyRate onBlur={this.validateHourlyRate} innerRef={node => this.hourlyRateInput = node} placeholder='Hourly Rate' />
          <HoursHardCap onBlur={this.validateHoursHardCap} innerRef={node => this.hoursHardCapInput = node} placeholder='Hours Hard Cap' />
        </InputsContainer>
        <InputsContainer>
          <PrepaymentCurrentValue disabled innerRef={node => this.prepaymentCurrentValueInput = node} />
          <Prepayment type='range' innerRef={node => this.prepaymentInput = node} onChange={this.updateRangeValue} />
          <PaymentOverlay innerRef={node => this.paymentOverlayNode = node} />
        </InputsContainer>

        <NewContractBtn onClick={this.createProject}>Create Contract</NewContractBtn>
      </Inner>
    )
  }

  validate = (evt) => {
    return [
      this.validateClientAddress(),
      this.validateContractName(),
      this.validateHourlyRate(),
      this.validateHoursHardCap(),
    ]
    .every(x => x)
  }

  validateClientAddress = () => {
    const isValid = EthereumAddress.isAddress(this.clientAddressInput.value)
    return this.markValid(isValid, this.clientAddressInput)
  }

  validateContractName = () => {
    const isValid = !!this.contractNameInput.value
    return this.markValid(isValid, this.contractNameInput)
  }

  validateHourlyRate = () => {
    const isValid = isNumber(this.hourlyRateInput.value)
    return this.markValid(isValid, this.hourlyRateInput)
  }

  validateHoursHardCap = () => {
    const isValid = isNumber(this.hoursHardCapInput.value)
    return this.markValid(isValid, this.hoursHardCapInput)
  }

  markValid = (isValid, input) => {
    if (isValid) {
      input.style.borderColor = '#cccccc'
    } else {
      input.style.borderColor = '#F44336'
    }
    return isValid
  }

  createProject = () => {
    this.validate() && this.props.actions.createContract(
      this.contractNameInput.value,
      this.clientAddressInput.value,
      Number(this.hourlyRateInput.value),
      Number(this.hoursHardCapInput.value) * 60,
      Number(this.prepaymentInput.value) * 10,
    )
  }

  updateRangeValue = () => {
    const val = this.prepaymentInput.value
    this.prepaymentCurrentValueInput.value = val + '% prepayment'
    const newWidth = 446 * val / 100
    this.paymentOverlayNode.style.width = newWidth + 'px'
  }

}


function isNumber(value) {
  return !(value == '' || isNaN(Number(value)))
}


export default connect(NewContractScreen)
