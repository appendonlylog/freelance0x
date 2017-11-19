import truffleContract from 'truffle-contract'
import BigNumber from 'bignumber.js'

import getWeb3 from '~/utils/get-web3'
import {promisifyCall} from '~/utils/promisify'

import ProjectABI from '../../build/contracts/Project.json'


const accountIndex = (() => {
  const match = /[?]acc(?:ount)?=(\d+)/.exec(window.location.search)
  console.debug('acct match:', match)
  return (match && match[1]) ? +match[1] : 0
})()


async function getAPI() {
  const web3 = await getWeb3()
  const accounts = await web3.eth.accounts
  const Project = truffleContract(ProjectABI)
  Project.setProvider(web3.currentProvider)
  return {web3, accounts, Project}
}


const apiPromise = getAPI()


export async function getAccount() {
  const {accounts} = await apiPromise
  return accounts[accountIndex]
}


export const State = {
  NotFound: -3,
  Fetching: -2,
  Creating: -1,
  Created: 0,
  Active: 1,
  Approved: 2,
  Cancelled: 3,
}


export const Role = {
  Stranger: 0,
  Contractor: 1,
  Client: 2,
}


export default class ProjectContract {

  static State = State
  static Role = Role

  static async deploy(name, clientAddress, hourlyRate, timeCapMinutes, prepayFractionThousands) {
    const {web3, accounts, Project} = await apiPromise
    const instance = await Project.new(
      name, clientAddress, hourlyRate, timeCapMinutes, prepayFractionThousands,
      {
        from: accounts[accountIndex],
        gas: 4000000,
      }
    )
    const contract = new ProjectContract(web3, accounts[accountIndex], instance)
    await contract.initialize()
    return contract
  }

  static async at(address) {
    const {web3, accounts, Project} = await apiPromise
    const instance = await Project.at(address).then(x => x)
    const contract = new ProjectContract(web3, accounts[accountIndex], instance)
    await contract.initialize()
    return contract
  }

  constructor(web3, account, instance) {
    this.web3 = web3
    this.account = account
    this.instance = instance
    this.web3Contract = instance.contract
  }

  // Fetches all contract props.
  //
  async initialize() {
    const {instance} = this
    const txOpts = {from: this.account}
    const [name, clientAddress, contractorAddress, hourlyRate,
      timeCapMinutes, prepayFractionThousands, myRole, _] = await Promise.all([
      instance.name(txOpts),
      instance.clientAddress(txOpts),
      instance.contractorAddress(txOpts),
      instance.hourlyRate(txOpts),
      instance.timeCapMinutes(txOpts),
      instance.prepayFractionThousands(txOpts),
      instance.getRole(txOpts),
      this.fetch(),
    ])
    this.name = name
    this.clientAddress = String(clientAddress)
    this.contractorAddress = String(contractorAddress)
    this.hourlyRate = new BigNumber('' + hourlyRate)
    this.timeCapMinutes = timeCapMinutes.toNumber()
    this.prepayFraction = prepayFractionThousands.toNumber() / 1000
    this.myRole = myRole.toNumber();
    console.debug(`contract ${this.address}, role ${this.myRole}`)
  }

  // Fetches mutable contract props.
  //
  async fetch() {
    const {instance} = this
    const txOpts = {from: this.account}
    const [state, executionDate, endDate, minutesReported,
      lastActivityDate, availableForWithdraw, balance] =
    await Promise.all([
      instance.state(txOpts),
      instance.executionDate(txOpts),
      instance.endDate(txOpts),
      instance.minutesReported(txOpts),
      instance.lastActivityDate(txOpts),
      instance.availableForWithdraw(txOpts),
      promisifyCall(this.web3.eth.getBalance, this.web3.eth, [instance.address]),
    ])
    this.state = state.toNumber()
    this.executionDate = executionDate.toNumber()
    this.endDate = endDate.toNumber()
    this.minutesReported = minutesReported.toNumber()
    this.lastActivityDate = lastActivityDate.toNumber()
    this.availableForWithdraw = new BigNumber(availableForWithdraw)
    this.balance = new BigNumber(balance)
  }

  serialize() {
    const {address, name, state, clientAddress, contractorAddress, executionDate, endDate,
      hourlyRate, timeCapMinutes, minutesReported, prepayFraction,
      balance, myRole, lastActivityDate, availableForWithdraw,} = this
    return {address, name, state, clientAddress, contractorAddress, executionDate, endDate,
      hourlyRate, timeCapMinutes, minutesReported, prepayFraction,
      balance, myRole, lastActivityDate, availableForWithdraw,
    }
  }

  get address() {
    return this.instance.address
  }

  start() {
    return promisifyCall(this.web3Contract.start, this.web3Contract, [{
      from: this.account,
      gas: 4000000,
      value: '100000000000000000',
    }])
  }

  setBillableTime(timeMinutes, comment) {
    return promisifyCall(this.web3Contract.setBillableTime, this.web3Contract, [timeMinutes, comment, {
      from: this.account,
      gas: 4000000,
      value: 0,
    }])
  }

  approve() {
    return promisifyCall(this.web3Contract.approve, this.web3Contract, [{
      from: this.account,
      gas: 4000000,
      value: 0,
    }])
  }

  cancel() {
    return promisifyCall(this.web3Contract.cancel, this.web3Contract, [{
      from: this.account,
      gas: 4000000,
      value: 0,
    }])
  }

  withdraw() {
    return promisifyCall(this.web3Contract.withdraw, this.web3Contract, [{
      from: this.account,
      gas: 4000000,
      value: 0,
    }])
  }

  leaveFeedback(positive, comment) {
    return promisifyCall(this.web3Contract.cancel, this.web3Contract, [positive, comment, {
      from: this.account,
      gas: 4000000,
      value: 0,
    }])
  }

}


if (DEBUG) {
  window.ProjectContract = ProjectContract
}
