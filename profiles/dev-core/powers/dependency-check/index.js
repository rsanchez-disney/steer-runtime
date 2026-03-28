const { execSync } = require('child_process');

module.exports = {
  async check_outdated({ path = '.' }) {
    try {
      if (require('fs').existsSync(`${path}/package.json`)) {
        const out = execSync('npm outdated --json 2>/dev/null || true', { cwd: path, encoding: 'utf8' });
        return { success: true, manager: 'npm', output: out || '{}' };
      }
      if (require('fs').existsSync(`${path}/pom.xml`)) {
        const out = execSync('mvn versions:display-dependency-updates -q 2>/dev/null || echo "mvn not available"', { cwd: path, encoding: 'utf8' });
        return { success: true, manager: 'maven', output: out };
      }
      return { success: false, output: 'No package.json or pom.xml found' };
    } catch (e) { return { success: false, error: e.message }; }
  },

  async check_vulnerabilities({ path = '.' }) {
    try {
      if (require('fs').existsSync(`${path}/package.json`)) {
        const out = execSync('npm audit --json 2>/dev/null || true', { cwd: path, encoding: 'utf8' });
        return { success: true, manager: 'npm', output: out };
      }
      if (require('fs').existsSync(`${path}/pom.xml`)) {
        const out = execSync('mvn dependency-check:check -q 2>/dev/null || echo "plugin not configured"', { cwd: path, encoding: 'utf8' });
        return { success: true, manager: 'maven', output: out };
      }
      return { success: false, output: 'No package.json or pom.xml found' };
    } catch (e) { return { success: false, error: e.message }; }
  }
};
