#!/usr/bin/env node
const path = require('path');
const PowerLoader = require('./powers/loader');

const powersDir = path.join(__dirname, 'powers');
const loader = new PowerLoader(powersDir);

console.log('Loading powers...\n');
loader.loadAll();

console.log('Available powers:', Array.from(loader.powers.keys()).join(', '));

// Test each power
async function testPowers() {
  console.log('\n--- Testing git-ops ---');
  const gitTools = loader.getTools(['git-ops']);
  const statusTool = gitTools.find(t => t.name === 'git_status');
  if (statusTool) {
    const result = await statusTool.handler({});
    console.log('git_status:', result);
  }

  console.log('\n--- Testing code-analysis ---');
  const codeTools = loader.getTools(['code-analysis']);
  const findTool = codeTools.find(t => t.name === 'find_files');
  if (findTool) {
    const result = await findTool.handler({ pattern: '*.md', path: '.' });
    console.log('find_files (*.md):', result.count, 'files found');
  }

  console.log('\n--- Testing file-ops ---');
  const fileTools = loader.getTools(['file-ops']);
  console.log('file-ops tools:', fileTools.map(t => t.name).join(', '));

  console.log('\n--- Testing test-runner ---');
  const testTools = loader.getTools(['test-runner']);
  const findTestsTool = testTools.find(t => t.name === 'find_tests');
  if (findTestsTool) {
    const result = await findTestsTool.handler({ path: '.' });
    console.log('find_tests:', result.count, 'test files found');
  }
}

testPowers().catch(console.error);
