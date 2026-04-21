# BOLT Migration Rules

## Angular 20 Target Stack
- Standalone components (no NgModules)
- Angular Signals for state management
- PrimeNG (Aura theme) for UI components
- Tailwind CSS 4 for styling
- Reactive Forms with typed FormGroup
- HttpClient with interceptors (auth, correlation-id, error handling)
- angular-auth-oidc-client for OIDC
- Vitest for unit tests, Playwright for E2E
- Nx monorepo workspace

## WebTier BFF Stack
- Node.js 20 LTS with Express or Fastify
- TypeScript
- OIDC middleware (replaces wdpr-api-security)
- Configurable API proxy engine (replaces wdpr-wam orchestrations)
- Custom handlers for file uploads (multipart)
- Structured logging (Pino)
- Jest for testing

## bolt-service (DO NOT MODIFY)
- Java 11, Spring 5.2, CXF 3.4, Hystrix, Tomcat 9
- The backend is explicitly out of scope for this migration
- WebTier BFF must forward requests identically to how WAM does today

## Coding Standards
- Follow conventional commits
- 90% unit test coverage for Angular app
- WCAG 2.1 AA accessibility compliance
- Lighthouse score ≥ 85
- Bundle size < 500KB initial load (gzipped)
