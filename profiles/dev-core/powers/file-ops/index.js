const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' });
  } catch (err) {
    return err.stdout || err.message;
  }
}

module.exports = {
  async backup_file({ file }) {
    if (!fs.existsSync(file)) {
      return { success: false, error: 'File not found' };
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backup = `${file}.backup-${timestamp}`;
    
    fs.copyFileSync(file, backup);
    
    return {
      success: true,
      backup_path: backup,
      output: `Backed up to: ${backup}`
    };
  },

  async compare_files({ file1, file2 }) {
    if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
      return { success: false, error: 'One or both files not found' };
    }
    
    const diff = exec(`diff -u ${file1} ${file2}`);
    const identical = diff.trim() === '';
    
    return {
      success: true,
      identical,
      output: identical ? 'Files are identical' : diff
    };
  },

  async find_duplicates({ path: searchPath = '.', pattern }) {
    let cmd = `find ${searchPath} -type f`;
    if (pattern) {
      cmd += ` -name "${pattern}"`;
    }
    cmd += ' -exec md5 {} \\; -exec echo {} \\; 2>/dev/null | paste - - | sort | uniq -d -w 32';
    
    const output = exec(cmd);
    const duplicates = output.split('\n').filter(l => l);
    
    return {
      success: true,
      count: duplicates.length,
      duplicates,
      output: duplicates.join('\n')
    };
  }
};
