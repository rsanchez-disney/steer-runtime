const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findSpecs(dir) {
  const patterns = ['openapi.yaml', 'openapi.yml', 'openapi.json', 'swagger.yaml', 'swagger.yml', 'swagger.json'];
  const found = [];
  try {
    const out = execSync(`find ${dir} -maxdepth 4 \\( ${patterns.map(p => `-name "${p}"`).join(' -o ')} \\) -not -path "*/node_modules/*"`, { encoding: 'utf8' });
    found.push(...out.trim().split('\n').filter(Boolean));
  } catch {}
  return found;
}

module.exports = {
  async extract_openapi({ path: dir = '.' }) {
    const specs = findSpecs(dir);
    if (specs.length === 0) return { success: false, output: 'No OpenAPI/Swagger spec found' };
    const results = specs.map(f => ({ file: f, content: fs.readFileSync(f, 'utf8').slice(0, 5000) }));
    return { success: true, specs: results };
  },

  async validate_contract({ file }) {
    if (!fs.existsSync(file)) return { success: false, error: `File not found: ${file}` };
    try {
      const content = fs.readFileSync(file, 'utf8');
      const issues = [];
      if (!content.includes('openapi') && !content.includes('swagger')) issues.push('Missing openapi/swagger version field');
      if (!content.includes('info')) issues.push('Missing info section');
      if (!content.includes('paths')) issues.push('Missing paths section');
      return { success: true, file, issues, valid: issues.length === 0 };
    } catch (e) { return { success: false, error: e.message }; }
  }
};
