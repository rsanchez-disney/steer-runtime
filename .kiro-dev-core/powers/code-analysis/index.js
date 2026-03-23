const { execSync } = require('child_process');

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  } catch (err) {
    return err.stdout || '';
  }
}

module.exports = {
  async find_files({ pattern, path = '.' }) {
    const cmd = `find ${path} -name "${pattern}" -type f 2>/dev/null | head -100`;
    const output = exec(cmd);
    const files = output.split('\n').filter(l => l);
    
    return {
      success: true,
      count: files.length,
      files,
      output: files.join('\n')
    };
  },

  async search_code({ query, path = '.', file_type }) {
    let cmd = `grep -r "${query}" ${path}`;
    if (file_type) {
      cmd += ` --include="*.${file_type}"`;
    }
    cmd += ' 2>/dev/null | head -50';
    
    const output = exec(cmd);
    const matches = output.split('\n').filter(l => l);
    
    return {
      success: true,
      count: matches.length,
      matches,
      output: matches.join('\n')
    };
  },

  async count_lines({ path = '.' }) {
    const cmd = `find ${path} -type f \\( -name "*.java" -o -name "*.ts" -o -name "*.js" -o -name "*.py" \\) -exec wc -l {} + 2>/dev/null | tail -1`;
    const output = exec(cmd);
    
    return {
      success: true,
      output: output.trim()
    };
  }
};
