'use strict';

var BN = require('irc.js').BN;
var zero = new BN(0);

module.exports = {
  stringifyBalance: function stringifyBalance(balance, bnDecimals) {
    if (balance.eq(zero)) {
      return '0';
    }

    var decimals = parseInt(bnDecimals.toString());
    if (decimals === 0) {
      return balance.toString();
    }

    var bal = balance.toString();
    var len = bal.length;
    var decimalIndex = len - decimals;
    var prefix = '';

    if (decimalIndex <= 0) {
      while (prefix.length <= decimalIndex * -1) {
        prefix += '0';
        len++;
      }
      bal = prefix + bal;
      decimalIndex = 1;
    }

    return bal.substr(0, len - decimals) + '.' + bal.substr(decimalIndex, 3);
  }
};