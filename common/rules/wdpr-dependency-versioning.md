# WDPR Dependency Versioning

For Node.js projects using Disney packages:

- **`@wdpr/` scoped packages** — use `^` (caret): allows minor updates
  ```json
  "@wdpr/ra-web-components-angular": "^2.0.0"
  ```

- **All other packages** — use `~` (tilde): allows patch updates only
  ```json
  "express": "~4.18.0",
  "typescript": "~5.3.0"
  ```

This ensures Disney packages stay compatible within minor versions while external packages are locked to patch-level updates for stability.

Always run `npm install` after updating `package.json` to sync `package-lock.json`.
