var _toConsumableArray = require("babel-runtime/helpers/toConsumableArray");

var _Promise = require("babel-runtime/core-js/promise");

var _classCallCheck = require("babel-runtime/helpers/classCallCheck");

var _createClass = require("babel-runtime/helpers/createClass");

var BN = require('irc.js').BN;

var util = require('./util');

var Token =
/*#__PURE__*/
function () {
  function Token() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Token);

    var address = opts.address,
        name = opts.name,
        symbol = opts.symbol,
        contract = opts.contract,
        owner = opts.owner;
    this.isLoading = !address || !name || !symbol;
    this.address = address || '0x0';
    this.name = name;
    this.symbol = symbol;
    this.balance = new BN('0', 16);
    this.decimals = new BN('18', 16);
    this.owner = owner;
    this.contract = contract;
    this.update().catch(function (reason) {
      return console.error('token updating failed', reason);
    });
  }

  _createClass(Token, [{
    key: "update",
    value: async function update() {
      var results = await _Promise.all([this.symbol || this.updateSymbol(), this.updateBalance(), this.decimals || this.updateDecimals()]);
      this.isLoading = false;
      return results;
    }
  }, {
    key: "serialize",
    value: function serialize() {
      return {
        address: this.address,
        symbol: this.symbol,
        balance: this.balance.toString(),
        string: this.stringify()
      };
    }
  }, {
    key: "stringify",
    value: function stringify() {
      return util.stringifyBalance(this.balance, this.decimals || new BN(0));
    }
  }, {
    key: "updateSymbol",
    value: async function updateSymbol() {
      var symbol = await this.updateValue('symbol');
      this.symbol = symbol || 'TKN';
      return this.symbol;
    }
  }, {
    key: "updateBalance",
    value: async function updateBalance() {
      this.balance = await this.updateValue('balance');
      return this.balance;
    }
  }, {
    key: "updateDecimals",
    value: async function updateDecimals() {
      if (this.decimals !== undefined) return this.decimals;
      var decimals = await this.updateValue('decimals');

      if (decimals) {
        this.decimals = decimals;
      }

      return this.decimals;
    }
  }, {
    key: "updateValue",
    value: async function updateValue(key) {
      var methodName;
      var args = [];

      switch (key) {
        case 'balance':
          methodName = 'balanceOf';
          args = [this.owner];
          break;

        default:
          methodName = key;
      }

      var result;

      try {
        var _contract;

        result = await (_contract = this.contract)[methodName].apply(_contract, _toConsumableArray(args));
      } catch (e) {
        console.warn("failed to load ".concat(key, " for token at ").concat(this.address));

        if (key === 'balance') {
          throw e;
        }
      }

      if (result) {
        var val = result[0];
        this[key] = val;
        return val;
      }

      return this[key];
    }
  }]);

  return Token;
}();

module.exports = Token;