# Node.js / TypeScript Conventions

## Code Style

- Use `const` for variables not reassigned, `let` for reassigned — never `var`
- Use arrow functions for anonymous functions and callbacks
- Use template literals for string interpolation
- Do not nest code more than 2 levels deep unless absolutely necessary
- Use `async/await` over `.then()/.catch()` chains
- Obey `.eslintrc.json`, `.prettierrc`, and `.editorconfig` rules

## Dependency Versioning

- `@wdpr/` scoped packages: use `^` (caret — minor updates allowed)
- All other packages: use `~` (tilde — patch updates only)
- Always run `npm install` after updating `package.json` to sync `package-lock.json`
- Remove unused dependencies

## Approved Node.js Versions

- **20.x** and **22.x** — production approved
- **24.x** — experimental support
- Earlier versions are unsupported — migrate if encountered

## Environment Variables

- Check for `.env` file when adding secrets or API keys
- Create `.env` with placeholder if missing, inform the user
- Always update `.env-EXAMPLE` accordingly
- Never hardcode secrets

## Testing

- Use Jest with `.spec.ts` extension
- `describe` blocks for grouping, `it` for individual cases
- `beforeEach`/`afterEach` for setup/teardown
- Cover happy path and error/failure scenarios
- Minimum 80% coverage
- Run `npm run test` and `npm run lint` before committing

## Config Files

- Do not modify `tsconfig.json` unless absolutely necessary — explain and get approval first
- Update `CHANGELOG.md` with semantic versioning (patch for fixes, minor for features, major for breaking)
- Update `README.md` if changes affect usage or setup
