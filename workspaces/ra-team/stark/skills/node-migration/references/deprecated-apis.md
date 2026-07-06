# Deprecated Node.js APIs by Version

## Detection command

```bash
grep -rn "new Buffer\|util\._extend\|require('domain')\|url\.parse(\|fs\.exists(" \
  --include="*.ts" --include="*.js" --include="*.mjs" \
  projects/ src/ 2>/dev/null
```

## API reference

| API | Status | Removed in | Replacement |
|-----|--------|-----------|-------------|
| `new Buffer(size)` | Deprecated | Node 10+ (runtime warning) | `Buffer.alloc(size)` |
| `new Buffer(string)` | Deprecated | Node 10+ (runtime warning) | `Buffer.from(string)` |
| `util._extend` | Removed | Node 22 | `Object.assign()` or spread `{...obj}` |
| `domain` module | Deprecated | Node 22+ (pending removal) | `AsyncLocalStorage` |
| `url.parse()` | Deprecated | Node 18+ (warning), Node 24+ (louder) | `new URL(input, base)` |
| `fs.exists()` | Deprecated | Node 1.0 | `fs.existsSync()` or `fs.access()` |
| `require()` of ESM | Error | Node 22+ (stricter) | `import()` or convert to ESM |
| `process.binding()` | Removed | Node 22 | Use public APIs |
| `SlowBuffer` | Deprecated | Node 10 | `Buffer.allocUnsafe()` |
| `crypto.createCipher()` | Removed | Node 22 | `crypto.createCipheriv()` |
| `tls.createSecurePair()` | Removed | Node 22 | `tls.TLSSocket` |
| `sys` module | Removed | Node 22 | `util` module |

## Express-specific breaking changes (v4 → v5)

| Change | v4 behavior | v5 behavior | Fix |
|--------|-------------|-------------|-----|
| Default export | `module.exports = express` | ESM-compatible default | `import express from 'express'` |
| `req.host` | Returns hostname only | Returns hostname:port | Use `req.hostname` |
| `req.query` | Mutable | Frozen object | Clone before mutating |
| `app.del()` | Alias for `app.delete()` | Removed | Use `app.delete()` |
| Path route matching | Loose | Strict (no optional trailing `/`) | Update routes |
| `res.send(status)` | Allowed number | Must use `res.sendStatus(n)` | Update calls |

## Angular compiler options deprecated

| Option | Deprecated in | Replacement |
|--------|--------------|-------------|
| `fullTemplateTypeCheck` | Angular 13 | `strictTemplates` |
| `enableIvy` | Angular 12 | Remove (always enabled) |
| `skipMetadataEmit` | Angular 13 | Remove |
| `strictMetadataEmit` | Angular 13 | Remove |
