var _Promise = require("babel-runtime/core-js/promise");

var _Object$getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _classCallCheck = require("babel-runtime/helpers/classCallCheck");

var _createClass = require("babel-runtime/helpers/createClass");

var _possibleConstructorReturn = require("babel-runtime/helpers/possibleConstructorReturn");

var _inherits = require("babel-runtime/helpers/inherits");

var IrcQuery = require('irc.js').Query;

var IrcContract = require('irc.js').Contract;

var Token = require('./token');

var BlockTracker = require('irc-block-tracker');

var abi = require('human-standard-token-abi');

var EventEmitter = require('events').EventEmitter;

var deepEqual = require('deep-equal');

var TokenTracker =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(TokenTracker, _EventEmitter);

  function TokenTracker() {
    var _this;

    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, TokenTracker);

    _this = _possibleConstructorReturn(this, (TokenTracker.__proto__ || _Object$getPrototypeOf(TokenTracker)).call(this));
    _this.userAddress = opts.userAddress || '0x0';
    _this.provider = opts.provider;
    var pollingInterval = opts.pollingInterval || 4000;
    _this.blockTracker = new BlockTracker({
      provider: _this.provider,
      pollingInterval: pollingInterval
    });
    _this.irc = new IrcQuery(_this.provider);
    _this.contract = new IrcContract(_this.irc);
    _this.TokenContract = _this.contract(abi);
    var tokens = opts.tokens || [];
    _this.tokens = tokens.map(_this.createTokenFrom.bind(_this));
    _this.running = true;

    _this.blockTracker.on('latest', _this.updateBalances.bind(_this));

    return _this;
  }

  _createClass(TokenTracker, [{
    key: "serialize",
    value: function serialize() {
      return this.tokens.map(function (token) {
        return token.serialize();
      });
    }
  }, {
    key: "updateBalances",
    value: async function updateBalances() {
      var _this2 = this;

      var oldBalances = this.serialize();
      return _Promise.all(this.tokens.map(function (token) {
        return token.updateBalance();
      })).then(function () {
        var newBalances = _this2.serialize();

        if (!deepEqual(newBalances, oldBalances)) {
          if (_this2.running) {
            _this2.emit('update', newBalances);
          }
        }
      }).catch(function (reason) {
        _this2.emit('error', reason);
      });
    }
  }, {
    key: "createTokenFrom",
    value: function createTokenFrom(opts) {
      var owner = this.userAddress;
      var address = opts.address,
          name = opts.name,
          symbol = opts.symbol;
      var contract = this.TokenContract.at(address);
      return new Token({
        address: address,
        name: name,
        symbol: symbol,
        contract: contract,
        owner: owner
      });
    }
  }, {
    key: "add",
    value: function add(opts) {
      var token = this.createTokenFrom(opts);
      this.tokens.push(token);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.running = false;
      this.blockTracker.stop();
    }
  }]);

  return TokenTracker;
}(EventEmitter);

module.exports = TokenTracker;
