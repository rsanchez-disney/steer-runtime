# wdpr-config-services - Development Guidelines

## Code Standards
- Follow SOLID, DRY, KISS, YAGNI principles
- OWASP best practices for security
- Conventional commits for all commit messages

## Testing
- Minimum 90% test coverage for new code
- Unit tests for all new methods
- Integration tests for new endpoints

## API Changes
- All API changes must be additive (backward compatible)
- Never remove or change existing field types
- New fields must be optional

## Error Handling
- Structured error responses with error codes
- Log all errors with context and correlation IDs
- Use appropriate HTTP status codes

## Security
- No secrets in code
- Input validation on all endpoints
- Use environment variables for configuration
