'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IrcQuery = require('irc.js').Query;
var IrcContract = require('irc.js').Contract;
var Token = require('./token');
var BlockTracker = require('irc-block-tracker');
var abi = require('irc.js').abi.stdTokenAbi;
var EventEmitter = require('events').EventEmitter;
var deepEqual = require('deep-equal');

var TokenTracker = function (_EventEmitter) {
  (0, _inherits3.default)(TokenTracker, _EventEmitter);

  function TokenTracker() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, TokenTracker);

    var _this = (0, _possibleConstructorReturn3.default)(this, (TokenTracker.__proto__ || (0, _getPrototypeOf2.default)(TokenTracker)).call(this));

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

  (0, _createClass3.default)(TokenTracker, [{
    key: 'serialize',
    value: function serialize() {
      return this.tokens.map(function (token) {
        return token.serialize();
      });
    }
  }, {
    key: 'updateBalances',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var _this2 = this;

        var oldBalances;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                oldBalances = this.serialize();
                return _context.abrupt('return', _promise2.default.all(this.tokens.map(function (token) {
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
                }));

              case 2:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function updateBalances() {
        return _ref.apply(this, arguments);
      }

      return updateBalances;
    }()
  }, {
    key: 'createTokenFrom',
    value: function createTokenFrom(opts) {
      var owner = this.userAddress;
      var address = opts.address,
          name = opts.name,
          symbol = opts.symbol;

      var contract = this.TokenContract.at(address);
      return new Token({ address: address, name: name, symbol: symbol, contract: contract, owner: owner });
    }
  }, {
    key: 'add',
    value: function add(opts) {
      var token = this.createTokenFrom(opts);
      this.tokens.push(token);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.running = false;
      this.blockTracker.removeAllListeners();
    }
  }]);
  return TokenTracker;
}(EventEmitter);

module.exports = TokenTracker;