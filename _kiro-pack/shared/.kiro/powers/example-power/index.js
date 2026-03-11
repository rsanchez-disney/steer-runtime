module.exports = {
  async echo({ message, prefix = 'Echo:' }) {
    return {
      success: true,
      output: `${prefix} ${message}`
    };
  }
};
