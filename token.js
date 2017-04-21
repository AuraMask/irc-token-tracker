const BN = require('ethjs').BN
const zero = new BN(0)
const format = require('./format').formatBalance

class Token {

  constructor (opts = {}) {
    const { address, symbol, balance, decimals, contract, owner } = opts
    this.isLoading = !address || !symbol || !balance || !decimals
    this.address = address || '0x0'
    this.symbol  = symbol || 'TKN'
    this.balance = new BN(balance || '0', 16)
    this.decimals = new BN(decimals || 0)
    this.owner = owner

    this.contract = contract
    this.update()
    .catch((reason) => {
      console.error('token updating failed', reason)
    })
  }

  async update() {
    const results = await Promise.all([
      this.updateSymbol(),
      this.updateBalance(),
      this.updateDecimals(),
    ])
    this.isLoading = false
    return results
  }

  serialize() {
    return {
      address: this.address,
      symbol: this.symbol,
      balance: this.balance.toString(10),
      decimals: parseInt(this.decimals.toString()),
      string: this.stringify(),
    }
  }

  stringify() {
    const decimals = parseInt(this.decimals.toString())
    return format(this.balance.toString(16), 3, decimals)
  }

  async updateSymbol() {
    const symbol = await this.updateValue('symbol')
    if (symbol) {
      this.symbol = symbol
    }
    return this.symbol
  }

  async updateBalance() {
    const balance = await this.updateValue('balance')
    this.balance = balance
    return this.balance
  }

  async updateDecimals() {
    var decimals = await this.updateValue('decimals')
    if (decimals) {
      this.decimals = decimals
    }
    return this.decimals
  }

  async updateValue(value) {
    let methodName
    let args = []

    switch (value) {
      case 'balance':
        methodName = 'balanceOf'
        args = [ this.owner ]
        break
      default:
        methodName = value
    }

    let result
    try {
      result = await this.contract[methodName](...args)
    } catch (e) {
      console.warn(`failed to load token ${value} for ${this.address}`)
      if (value === 'balance') {
        throw e
      }
    }

    if (result) {
      const val = result[0]
      return val
    }
    return this[value]
  }

}

module.exports = Token
