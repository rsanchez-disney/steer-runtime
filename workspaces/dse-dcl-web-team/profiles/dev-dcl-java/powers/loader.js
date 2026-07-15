const fs = require('fs');
const path = require('path');

class PowerLoader {
  constructor(powersDir) {
    this.powersDir = powersDir;
    this.powers = new Map();
  }

  loadAll() {
    const dirs = fs.readdirSync(this.powersDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'));
    
    for (const dir of dirs) {
      try {
        this.loadPower(dir.name);
      } catch (err) {
        console.error(`Failed to load power ${dir.name}:`, err.message);
      }
    }
    return this.powers;
  }

  loadPower(name) {
    const powerDir = path.join(this.powersDir, name);
    const defPath = path.join(powerDir, 'power.json');
    const implPath = path.join(powerDir, 'index.js');

    const definition = JSON.parse(fs.readFileSync(defPath, 'utf8'));
    const implementation = require(implPath);

    this.powers.set(name, { definition, implementation });
    return { definition, implementation };
  }

  getTools(powerNames) {
    const tools = [];
    for (const name of powerNames) {
      const power = this.powers.get(name);
      if (!power) continue;
      
      for (const tool of power.definition.tools) {
        tools.push({
          ...tool,
          handler: power.implementation[tool.name]
        });
      }
    }
    return tools;
  }
}

module.exports = PowerLoader;
