const { execSync } = require('child_process');

function exec(cmd, cwd = '.') {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd, maxBuffer: 10 * 1024 * 1024 });
  } catch (err) {
    return { stdout: err.stdout || '', stderr: err.stderr || '', failed: true };
  }
}

module.exports = {
  async run_tests({ command, path = '.' }) {
    const result = exec(command, path);
    const failed = typeof result === 'object' && result.failed;
    
    return {
      success: !failed,
      output: typeof result === 'string' ? result : result.stdout + result.stderr,
      command
    };
  },

  async find_tests({ path = '.', framework }) {
    const patterns = {
      jest: '*.test.js *.spec.js *.test.ts *.spec.ts',
      junit: '*Test.java',
      pytest: 'test_*.py *_test.py',
      default: '*test* *spec*'
    };
    
    const pattern = patterns[framework] || patterns.default;
    const cmd = `find ${path} -type f \\( ${pattern.split(' ').map(p => `-name "${p}"`).join(' -o ')} \\) 2>/dev/null | head -100`;
    
    const output = exec(cmd);
    const files = (typeof output === 'string' ? output : output.stdout).split('\n').filter(l => l);
    
    return {
      success: true,
      count: files.length,
      files,
      output: files.join('\n')
    };
  },

  async test_coverage({ command }) {
    const result = exec(command);
    const output = typeof result === 'string' ? result : result.stdout;
    
    return {
      success: true,
      output,
      command
    };
  }
};
