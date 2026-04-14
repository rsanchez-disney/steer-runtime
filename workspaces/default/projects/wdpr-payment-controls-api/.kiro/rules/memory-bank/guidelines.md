# wdpr-payment-controls-api - Development Guidelines

## Code Standards
- TypeScript strict mode
- Follow SOLID, DRY, KISS principles
- Conventional commits for all commit messages

## Testing
- Minimum 90% test coverage for new code
- Unit tests for all controllers and services
- Integration tests for API endpoints

## API Changes
- All API changes must be additive (backward compatible)
- Use TypeScript interfaces for request/response types
- Validate all inputs with validation libraries (Joi/class-validator)

## Error Handling
- Structured JSON error responses with error codes
- Log errors with context and correlation IDs
- Appropriate HTTP status codes

## Security
- No secrets in code
- Input sanitization to prevent injection
- Use environment variables for configuration
