import React from 'react'
import styled from 'styled-components'
import {Link} from 'react-router-dom'

import connect from '~/utils/connect'
import sel from '~/selectors'

import SplashScreen from './splash-screen'

// import background from '../../assets/background.png'
import logo from '../../assets/logo.svg'


// background: url(${background}) no-repeat center / cover;
const LayoutContainer = styled.div`
  font-face: sans-serif;
  font-size: 16px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 40px;
  background-attachment: fixed;
  color: #242738;
`

const Logo = styled(Link)`
  position: fixed;
  top: 60px;
  left: 70px;
  width: 85px;
  height: 85px;
  background: url(${logo}) no-repeat center / contain;
`

const AppContainer = styled.div`
  font-family: 'Proxima Nova';
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 700px;
  margin: 60px 0;
  padding: 0 0;
  box-sizing: border-box;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  min-height: 600px;
`

const ErrorMessage = styled.div`
  font-family: 'Proxima Nova';
  color: #bad7f3;
  text-align: center;
  & a {
    color: #699eff;
  }
`

const ErrorMessageTitle = styled.div`
  font-size: 22px;
  margin-bottom: 25px;
`

const ErrorMessageDetail = styled.div`
  font-size: 16px;
  line-height: 130%;
`

export class Layout extends React.Component {

  static mapStateToProps(state) {
    return {
      isConnected: sel.isConnected(state),
      hasNoEthereumClientInstalled: sel.hasNoEthereumClientInstalled(state),
      needsToLogIn: sel.needsToLogIn(state),
    }
  }

  render() {
    if (this.props.hasNoEthereumClientInstalled) {
      return this.renderSplashScreen(this.renderNoEthereumClientMessage())
    }
    if (!this.props.isConnected) {
      return this.renderSplashScreen()
    }
    if (this.props.needsToLogIn) {
      return this.renderSplashScreen(this.renderNeedsToLogInMessage())
    }
    return this.renderApp()
  }

  renderApp() {
    return (
      <LayoutContainer>
        <Logo to='/' />
        <AppContainer>
          {this.props.children}
        </AppContainer>
      </LayoutContainer>
    )
  }

  renderSplashScreen(message) {
    return <SplashScreen message={message} />
  }

  renderNoEthereumClientMessage() {
    const metamaskLink = this.getMetaMaskLink()
    const clientLink = 'http://www.ethdocs.org/en/latest/ethereum-clients/choosing-a-client.html'
    return (
      <ErrorMessage>
        <ErrorMessageTitle>No Ethereum client installed</ErrorMessageTitle>
        <ErrorMessageDetail>
          Please install <a href={metamaskLink} target='_blank'>MetaMask browser extension</a> or
          <br/>run <a href={clientLink} target='_blank'>an Ethereum client</a>, then
          reload this page.
        </ErrorMessageDetail>
      </ErrorMessage>
    )
  }

  renderNeedsToLogInMessage() {
    const metamaskLink = this.getMetaMaskLink()
    return (
      <ErrorMessage>
        <ErrorMessageTitle>No Ethereum account found</ErrorMessageTitle>
        <ErrorMessageDetail>
          If you have <a href={metamaskLink} target='_blank'>MetaMask browser extension</a>,
          <br />open it and log in, then reload this page.
        </ErrorMessageDetail>
      </ErrorMessage>
    )
  }

  getMetaMaskLink() {
    return (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0
      ? 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask'
      : 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn'
    )
  }
}


export default connect(Layout)
