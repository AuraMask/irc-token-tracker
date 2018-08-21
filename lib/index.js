const IrcQuery = require('irc.js').Query;
const IrcContract = require('irc.js').Contract;
const Token = require('./token');
const BlockTracker = require('irc-block-tracker');
const abi = require('human-standard-token-abi');
const EventEmitter = require('events').EventEmitter;
const deepEqual = require('deep-equal');

class TokenTracker extends EventEmitter {

  constructor(opts = {}) {
    super();

    this.userAddress = opts.userAddress || '0x0';
    this.provider = opts.provider;
    const pollingInterval = opts.pollingInterval || 4000;
    this.blockTracker = new BlockTracker({
      provider: this.provider,
      pollingInterval,
    });

    this.irc = new IrcQuery(this.provider);
    this.contract = new IrcContract(this.irc);
    this.TokenContract = this.contract(abi);

    const tokens = opts.tokens || [];

    this.tokens = tokens.map(this.createTokenFrom.bind(this));

    this.running = true;
    this.blockTracker.on('latest', this.updateBalances.bind(this));
  }

  serialize() {
    return this.tokens.map(token => token.serialize());
  }

  async updateBalances() {
    const oldBalances = this.serialize();
    return Promise.all(this.tokens.map(token => token.updateBalance())).then(() => {
      const newBalances = this.serialize();
      if (!deepEqual(newBalances, oldBalances)) {
        if (this.running) {
          this.emit('update', newBalances);
        }
      }
    }).catch((reason) => {
      this.emit('error', reason);
    });
  }

  createTokenFrom(opts) {
    const owner = this.userAddress;
    const {address, name, symbol} = opts;
    const contract = this.TokenContract.at(address);
    return new Token({address, name, symbol, contract, owner});
  };

  add(opts) {
    const token = this.createTokenFrom(opts);
    this.tokens.push(token);
  }

  stop() {
    this.running = false;
    this.blockTracker.stop();
  }
}

module.exports = TokenTracker;
