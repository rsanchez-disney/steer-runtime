---
inclusion: fileMatch
fileMatchPattern: ["**/*_test.go", "**/*.go", ".mockery.yaml", ".covignore"]
description: Testing patterns, mockery configuration, coverage, and test conventions
---

# OpSheet+ Go — Testing Patterns

## Mocks directory location

All the necessary mocks are located in ./mocks

## Test File Location

Tests live alongside the code they test:

```
internal/core/services/counts_service.go
internal/core/services/counts_service_test.go
```

## Table-Driven Tests

Preferred pattern for all tests:

```go
func TestCountsService_GetByEntity(t *testing.T) {
    tests := []struct {
        name      string
        entityID  string
        mockSetup func(*mocks.CountsRepository)
        want      *models.Counts
        wantErr   bool
    }{
        {
            name:     "success",
            entityID: "entity-123",
            mockSetup: func(m *mocks.CountsRepository) {
                m.EXPECT().FindByEntity(mock.Anything, "entity-123").
                    Return(&models.Counts{ID: "entity-123", Value: 42}, nil)
            },
            want:    &models.Counts{ID: "entity-123", Value: 42},
            wantErr: false,
        },
        {
            name:     "not found",
            entityID: "missing",
            mockSetup: func(m *mocks.CountsRepository) {
                m.EXPECT().FindByEntity(mock.Anything, "missing").
                    Return(nil, core.ErrEntityNotFound)
            },
            want:    nil,
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            repo := mocks.NewCountsRepository(t)
            tt.mockSetup(repo)

            svc := service.NewCountsService(repo)
            got, err := svc.GetByEntity(context.Background(), tt.entityID)

            if tt.wantErr {
                assert.Error(t, err)
                return
            }
            assert.NoError(t, err)
            assert.Equal(t, tt.want, got)
        })
    }
}
```

## Mockery

### Configuration (`.mockery.yaml`)

```yaml
dir: mocks/{{replaceAll .InterfaceDirRelative "internal" "internal_"}}
with-expecter: true
filename: "mock_{{.InterfaceName | snakecase}}.go"
all: true
disable-version-string: true
mockname: "{{.InterfaceName}}"
packages:
  github.disney.com/.../internal/core/services:
    config:
  github.disney.com/.../internal/core/repositories:
    config:
```

### Regenerating Mocks

```bash
make mock   # Deletes mocks/ and regenerates all
```

Always regenerate after changing interfaces.

### Using Mocks

```go
// Create mock with test cleanup
repo := mocks.NewCountsRepository(t)

// Set expectations with EXPECT()
repo.EXPECT().FindByEntity(mock.Anything, "entity-123").
    Return(&models.Counts{Value: 42}, nil)

// For any argument matching
repo.EXPECT().Save(mock.Anything, mock.AnythingOfType("*models.Counts")).
    Return(nil)
```

## Coverage

### Minimum Threshold: 75%

Enforced via `scripts/cov.sh`:

```bash
make cover       # Run coverage with threshold check
make cover-dev   # Coverage + race detection + HTML report
```

### Excluded from Coverage

Configured via `.covignore` or `CVPKG` in Makefile:
- `mocks/`
- `cmd/api/` (entry point)
- `internal/app/` (bootstrap wiring)
- `docs/` (swagger generated)

## Test Conventions

- Use `testify/assert` and `testify/require` for assertions
- Use `mock.Anything` for context parameters
- Use `mock.AnythingOfType("*models.Type")` for typed argument matching
- Pass `t` to mock constructors for automatic cleanup: `mocks.NewService(t)`
- Name test cases descriptively: `"success"`, `"not found"`, `"invalid input"`
- Test error cases, not just happy paths
- Test edge cases: nil inputs, empty slices, zero values

## Race Detection

```bash
make race        # Run tests with -race flag
make cover-dev   # Coverage with race detection
```

Requires `CGO_ENABLED=1` for race detector.

## Do Not

- Do not import from `mocks/` in production code
- Do not use real external services in unit tests — mock all I/O boundaries
- Do not skip error case tests
- Do not use `t.Skip()` without a TODO ticket reference
