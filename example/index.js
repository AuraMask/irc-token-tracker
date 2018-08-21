const TokenTracker = require('../');
const Irc = require('irc.js');
const irc = new Irc(new Irc.HttpProvider('http://localhost:8545'), null);

const userAddress = '0xb3f1507591583ebf14b5b31d134d700c83c20fa1';
const tokenAddress = '0x83b28cf98ede901f3d07d0fd04921c103d63668c';

const tokenTracker = new TokenTracker({
  provider: irc.currentProvider,
  userAddress,
  tokens: [{address: tokenAddress}],
});

// You can use this method to check the state of the tokens
window.setInterval(function checkBalance() {
  const balances = tokenTracker.serialize();
  console.log('serialized', balances);
  infoParagraph.innerText = JSON.stringify(balances);
}, 1000);
console.dir(tokenTracker);

// You can also subscribe to updates
tokenTracker.on('update', function(balances) {
  console.log(`Your balance of ${balances[0].symbol} is ${balances[0].string}`);
});

window.tokenTracker = tokenTracker;

tokenTracker.on('error', function(reason) {
  console.log('there was a problem!', reason);
  console.trace(reason);
});

