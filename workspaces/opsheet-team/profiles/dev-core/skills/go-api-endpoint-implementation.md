# Skill: Go API endpoint implementation

Use when adding or modifying HTTP endpoints in Go API services.

## Steps

1. Define or update the model in `internal/models/`
2. Define or update the interface in `internal/core/` (service and/or repository)
3. Implement the service method in the service layer
4. Add the controller handler in `internal/http/controllers/v1/` with Swagger annotations
5. Register the route in `internal/http/routes/`
6. Wire dependencies in `internal/app/`
7. Add table-driven tests for service and controller
8. Regenerate mocks: `make mock`
9. Update Swagger: `make build` (runs `swag init`)

## Checklist

- [ ] Model defined with proper JSON tags
- [ ] Interface in `core/` — no concrete dependencies
- [ ] Service implements business logic, controller stays thin
- [ ] Swagger annotations on controller method
- [ ] Route registered with correct HTTP method and path
- [ ] Input validation on request parameters/body
- [ ] Error responses use proper HTTP status codes
- [ ] Table-driven tests for happy path and error cases
- [ ] Mocks regenerated
- [ ] `make build && make test && make lint` passes
