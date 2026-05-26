/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ["eslint-config-disney/node"],
    ignorePatterns: ["build/", "node_modules/"],
    rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
    },
};
