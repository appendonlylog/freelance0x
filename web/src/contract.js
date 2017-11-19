import truffleContract from 'truffle-contract'
import BigNumber from 'bignumber.js'

import {getConnection} from '~/connection'
import {promisifyCall} from '~/utils/promisify'

import ProjectABI from '../../build/contracts/Project.json'


// Fail if tx is going to take more gas than this.
//
const GAS_HARD_LIMIT = 4700000


async function getAPI() {
  const connection = await getConnection()
  const Project = truffleContract(ProjectABI)
  Project.setProvider(web3.currentProvider)
  return {connection, Project}
}


const apiPromise = getAPI()


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
    const {connection, Project} = await apiPromise
    const instance = await Project.new(
      name, clientAddress, hourlyRate, timeCapMinutes, prepayFractionThousands,
      {from: account, gas: 4000000}
    )
    const contract = new ProjectContract(connection, instance)
    await contract.initialize()
    return contract
  }

  static async at(address) {
    const {connection, Project} = await apiPromise
    const instance = await Project.at(address).then(x => x)
    const contract = new ProjectContract(connection, instance)
    await contract.initialize()
    return contract
  }

  constructor(connection, instance) {
    this.connection = connection
    this.account = connection.account
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
    const {eth} = this.connection.web3
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
      promisifyCall(eth.getBalance, eth, [instance.address]),
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
    const {connection, address, name, state, clientAddress, contractorAddress, executionDate,
      endDate, hourlyRate, timeCapMinutes, minutesReported, prepayFraction,
      balance, myRole, lastActivityDate, availableForWithdraw,} = this
    const {networkId} = connection
    return {networkId, address, name, state, clientAddress, contractorAddress, executionDate,
      endDate, hourlyRate, timeCapMinutes, minutesReported, prepayFraction,
      balance, myRole, lastActivityDate, availableForWithdraw,
    }
  }

  get address() {
    return this.instance.address
  }

  start() {
    const value = '100000000000000000' // TODO: ask contract
    return this._callContractMethod('start', null, value)
  }

  setBillableTime(timeMinutes, comment) {
    return this._callContractMethod('setBillableTime', [timeMinutes, comment])
  }

  approve() {
    return this._callContractMethod('approve')
  }

  cancel() {
    return this._callContractMethod('cancel')
  }

  withdraw() {
    return this._callContractMethod('withdraw')
  }

  leaveFeedback(positive, comment) {
    return this._callContractMethod('leaveFeedback', [positive, comment])
  }

  //
  // Helpers
  //

  async _callContractMethod(methodName, args = null, value = 0) {
    const method = this.web3Contract[methodName]

    const gasEstOpts = {
      from: this.account,
      gas: this.connection.blockGasLimit,
      value: value,
    }

    const gasEstCallArgs = args ? [...args, gasEstOpts] : [gasEstOpts]
    const gasEstimation = await promisifyCall(method.estimateGas, method, gasEstCallArgs)

    if (Number(gasEstimation) > GAS_HARD_LIMIT) {
      throw new Error(`transaction takes more than ${GAS_HARD_LIMIT} gas`)
    }

    const txOpts = {
      from: this.account,
      gas: gasEstimation,
      value: value,
    }

    const txArgs = args ? [...args, txOpts] : [txOpts]
    return promisifyCall(method, this.web3Contract, txArgs)
  }

}


if (DEBUG) {
  window.ProjectContract = ProjectContract
}
