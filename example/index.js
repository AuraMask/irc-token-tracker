const TokenTracker = require('../');
const Irc = require('irc.js');
const irc = new Irc(new Irc.HttpProvider('http://localhost:8545'), null);

const userAddress = '0x08f0b05f93445F3857a5a4E818129c6397b58A45';
const tokenAddress = '0x5b729f7065f7098befef38a8eee8f7edab9831b9';

const tokenTracker = new TokenTracker({
  provider: irc.currentProvider,
  userAddress,
  tokens: [{address: tokenAddress}],
});

// You can use this method to check the state of the tokens
window.setInterval(() => {
  const balances = tokenTracker.serialize();
  infoParagraph.innerText = JSON.stringify(balances);
}, 1000);
console.dir(tokenTracker);

// You can also subscribe to updates
tokenTracker.on('update', balances => {
  console.log(`Your balance of ${balances[0].symbol} is ${balances[0].string}`);
});

window.tokenTracker = tokenTracker;

tokenTracker.on('error', reason => {
  console.log('there was a problem!', reason);
  console.trace(reason);
});

