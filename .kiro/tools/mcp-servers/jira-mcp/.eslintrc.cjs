/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ["eslint-config-disney/node"],
    ignorePatterns: ["build/", "node_modules/"],
    rules: {
        // Allow existing code patterns - can be tightened over time
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
    },
};
