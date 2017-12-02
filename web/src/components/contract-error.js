import React from 'react'
import styled from 'styled-components'


const ErrorMessageWrapper = styled.div`
  height: 480px;
  padding: 60px 30px;

  flex: 1;
  display: flex;
  flex-direction: column;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;

  font-family: 'Muller';
  color: #242737;

  span {
    font-family: 'Apple Color Emoji';
    font-size: 64px;
    margin-bottom: 24px;
  }
`

const ErrorTitle = styled.div`
  font-weight: 500;
  font-size: 26px;
  letter-spacing: -0.79px;
`

const ErrorDetails = styled.div`
  font-weight: 400;
  font-size: 18px;
  max-width: 450px;
  text-align: center;
  margin-top: 20px;
`


export default function ContractError({title, details}) {
  return (
    <ErrorMessageWrapper>
      <span>😢</span>
      <ErrorTitle>{title}</ErrorTitle>
      {details && <ErrorDetails>{details}</ErrorDetails>}
    </ErrorMessageWrapper>
  )
}
