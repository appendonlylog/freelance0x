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

export class Layout extends React.Component {

  static mapStateToProps(state) {
    return {
      isConnected: sel.isConnected(state),
    }
  }

  render() {
    return this.props.isConnected ? this.renderApp() : <SplashScreen />
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
}


export default connect(Layout)
