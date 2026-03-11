#!/usr/bin/env node
const path = require('path');
const PowerLoader = require('../shared/.kiro/powers/loader');

const powersDir = path.join(__dirname, '../shared/.kiro/powers');
const loader = new PowerLoader(powersDir);

console.log('Loading powers...');
loader.loadAll();

console.log('\nLoaded powers:', Array.from(loader.powers.keys()));

const tools = loader.getTools(['example-power']);
console.log('\nAvailable tools:', tools.map(t => t.name));

// Test echo tool
const echoTool = tools.find(t => t.name === 'echo');
if (echoTool) {
  console.log('\nTesting echo tool...');
  echoTool.handler({ message: 'Hello, Kiro Powers!' })
    .then(result => console.log('Result:', result))
    .catch(err => console.error('Error:', err));
}
