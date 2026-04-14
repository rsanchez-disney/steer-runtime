# Golden Rules for Config Studio Development

These rules MUST be followed for all code changes. They are enforced at approval gates.

## 1. Backward Compatibility

**Rule**: All API changes must be additive. Never break existing contracts.

**Examples**:
- ✅ Add new optional field to DTO
- ✅ Add new endpoint
- ✅ Add new method overload
- ❌ Remove field from DTO
- ❌ Change field type
- ❌ Remove endpoint

**Validation**:
- Review API contracts before and after
- Check for removed or modified fields
- Verify existing tests still pass

## 2. Test Coverage ≥90%

**Rule**: All new code must have ≥90% test coverage.

**Requirements**:
- Unit tests for all new methods
- Integration tests for new endpoints
- E2E tests for critical user flows

**Validation**:
- Run coverage report
- Check percentage for changed files
- Fail if <90%

## 3. No Secrets in Code

**Rule**: Never commit credentials, API keys, or sensitive data.

**Examples**:
- ❌ Hardcoded passwords
- ❌ API keys in code
- ❌ Database connection strings
- ✅ Environment variables
- ✅ Secret management service
- ✅ Configuration files (gitignored)

**Validation**:
- Scan code for patterns (password=, api_key=, secret=)
- Check for base64 encoded strings
- Verify .env files are gitignored

## 4. Structured Logging

**Rule**: Use structured logging with context for all important events.

**Format**:
```java
// Java
log.info("Export started", kv("exportId", id), kv("userId", userId));
```

```typescript
// TypeScript
logger.info('Export started', { exportId: id, userId: userId });
```

**Requirements**:
- Log all API requests
- Log errors with stack traces
- Include correlation IDs
- Use appropriate log levels (DEBUG, INFO, WARN, ERROR)

## 5. Minimal Diff

**Rule**: Change only what's necessary. Keep PRs focused.

**Guidelines**:
- One story = one PR
- Don't refactor unrelated code
- Don't reformat entire files
- Don't add unused dependencies

**Validation**:
- Review diff size
- Check for unrelated changes
- Verify all changes map to acceptance criteria

## 6. Input Validation

**Rule**: Validate all user inputs. Never trust client data.

**Requirements**:
- Validate request parameters
- Sanitize inputs to prevent injection
- Return clear error messages
- Use validation libraries (Joi, class-validator)

**Examples**:
```typescript
// Validate export ID
if (!exportId || !/^[a-zA-Z0-9-]+$/.test(exportId)) {
  return res.status(400).json({ error: 'Invalid export ID' });
}
```

## 7. Error Handling

**Rule**: Handle all errors gracefully. Return structured error responses.

**Format**:
```json
{
  "error": "Export not found",
  "code": "EXPORT_NOT_FOUND",
  "details": "Export with ID 'abc123' does not exist",
  "timestamp": "2026-03-02T10:00:00Z"
}
```

**Requirements**:
- Use try/catch blocks
- Log errors with context
- Return appropriate HTTP status codes
- Don't expose internal errors to clients

## 8. Accessibility

**Rule**: All UI changes must be accessible (WCAG 2.1 Level AA).

**Requirements**:
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management
- Screen reader compatible
- Color contrast ≥4.5:1

**Validation**:
- Test with keyboard only
- Test with screen reader
- Run accessibility linter

## 9. Performance

**Rule**: Don't introduce performance regressions.

**Guidelines**:
- Avoid N+1 queries
- Use pagination for large datasets
- Cache expensive operations
- Optimize database queries
- Lazy load when possible

**Validation**:
- Run performance tests
- Check query counts
- Monitor response times

## 10. Documentation

**Rule**: Document all public APIs and complex logic.

**Requirements**:
- JavaDoc/JSDoc for public methods
- README updates for new features
- API documentation (OpenAPI/Swagger)
- Inline comments for complex logic

---

## Enforcement

These rules are checked at:
1. **Gate 2**: Implementation Review - Manual review of changes
2. **Gate 4**: Test Results - Automated coverage check
3. **Gate 5**: PR Review - Final validation before merge

Violations will result in rejection at approval gates.

## 11. Cross-Platform Tool Usage

**Rule**: Use built-in agent tools instead of platform-specific shell commands.

**Banned Commands**:
- ❌ `findstr` — Windows-only, unreliable regex, breaks on macOS/Linux
- ❌ `dir` — use `fs_read` (Directory mode) or `ls`
- ❌ `type` — use `fs_read` (Line mode) or `cat`

**Preferred Alternatives**:
- ✅ `grep` tool for all file content searches
- ✅ `fs_read` for reading files and listing directories
- ✅ `code` tool for symbol search and AST analysis
- ✅ `execute_bash` with cross-platform commands (`ls`, `cat`, `find`) when no agent tool fits

**Why**: Agents run on macOS, Linux, and Windows. Platform-specific commands break for teammates on different OSes and produce inconsistent results.
