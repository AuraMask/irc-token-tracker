const BN = require('irc.js').BN;
const util = require('./util');

class Token {
  constructor(opts = {}) {
    const {address, name, symbol, contract, owner} = opts;
    this.isLoading = !address || !name || !symbol;
    this.address = address || '0x0';
    this.name = name;
    this.symbol = symbol;
    this.balance = new BN('0', 16);
    this.decimals = new BN('18', 16);
    this.owner = owner;

    this.contract = contract;
    this.update().catch(reason => console.error('token updating failed', reason));
  }

  async update() {
    const results = await Promise.all([
      this.symbol || this.updateSymbol(),
      this.updateBalance(),
      this.decimals || this.updateDecimals(),
    ]);
    this.isLoading = false;
    return results;
  }

  serialize() {
    return {
      address: this.address,
      symbol: this.symbol,
      balance: this.balance.toString(),
      string: this.stringify(),
    };
  }

  stringify() {
    return util.stringifyBalance(this.balance, this.decimals || new BN(0));
  }

  async updateSymbol() {
    const symbol = await this.updateValue('symbol');
    this.symbol = symbol || 'TKN';
    return this.symbol;
  }

  async updateBalance() {
    this.balance = await this.updateValue('balance');
    return this.balance;
  }

  async updateDecimals() {
    if (this.decimals !== undefined) return this.decimals;
    const decimals = await this.updateValue('decimals');
    if (decimals) {
      this.decimals = decimals;
    }
    return this.decimals;
  }

  async updateValue(key) {
    let methodName;
    let args = [];

    switch (key) {
      case 'balance':
        methodName = 'balanceOf';
        args = [this.owner];
        break;
      default:
        methodName = key;
    }

    let result;
    try {
      result = await this.contract[methodName](...args);
    } catch (e) {
      console.warn(`failed to load ${key} for token at ${this.address}`);
      if (key === 'balance') {
        throw e;
      }
    }

    if (result) {
      const val = result[0];
      this[key] = val;
      return val;
    }
    return this[key];
  }

}

module.exports = Token;
