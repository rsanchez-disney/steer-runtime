const { execSync } = require('child_process');

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (err) {
    return err.stdout || err.message;
  }
}

module.exports = {
  async git_status() {
    const branch = exec('git branch --show-current').trim();
    const status = exec('git status --short');
    const ahead = exec('git rev-list --count @{u}..HEAD 2>/dev/null').trim() || '0';
    
    return {
      success: true,
      branch,
      ahead: parseInt(ahead),
      changes: status.split('\n').filter(l => l).length,
      output: status
    };
  },

  async git_diff({ file, staged = false }) {
    const cmd = staged ? 'git diff --staged' : 'git diff';
    const diff = file ? exec(`${cmd} ${file}`) : exec(cmd);
    
    return {
      success: true,
      output: diff
    };
  },

  async git_log({ limit = 10 }) {
    const log = exec(`git log --oneline -n ${limit}`);
    
    return {
      success: true,
      commits: log.split('\n').filter(l => l),
      output: log
    };
  }
};
