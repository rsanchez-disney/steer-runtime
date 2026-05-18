---
inclusion: fileMatch
fileMatchPattern: ["**/*.go", "go.mod"]
description: HTTP error handling convention — sentinel errors, error mapping, handleError pattern
---

# OpSheet+ Go — HTTP Error Handling Convention

## Required HTTP Status Codes

Every API service must handle at minimum:

| Status | When to Use |
|--------|-------------|
| `400 Bad Request` | Malformed request, missing required fields, invalid format |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Duplicate records, overlapping date ranges, concurrent modification |
| `422 Unprocessable Entity` | Valid syntax but fails business validation rules |
| `500 Internal Server Error` | Unexpected failures (DB errors, panics, unhandled cases) |
| `503 Service Unavailable` | External dependency down, circuit breaker open |

## Architecture Pattern

### 1. Sentinel Errors in Services

Define typed sentinel errors in the service layer. Services never reference HTTP concepts.

```go
// internal/core/services/errors.go
package services

import "errors"

var (
    ErrEntityNotFound       = errors.New("entity not found")
    ErrDuplicateRecord      = errors.New("duplicate record")
    ErrDateRangeOverlap     = errors.New("date range overlaps existing record")
    ErrInvalidConfiguration = errors.New("invalid configuration")
    ErrExternalServiceDown  = errors.New("external service unavailable")
)
```

### 2. Error Details Map in Controllers

Each controller defines a declarative map from sentinel errors to HTTP status + translation key.

```go
// internal/http/controllers/v1/error_mapping.go
package v1

import (
    "net/http"
    "module/internal/core/services"
)

type errorDetails struct {
    status         int
    translationKey string
    displayError   error
}

var detailsByError = map[error]errorDetails{
    services.ErrEntityNotFound: {
        status:         http.StatusNotFound,
        translationKey: "_ERROR.ENTITY.NOTFOUND",
    },
    services.ErrDuplicateRecord: {
        status:         http.StatusConflict,
        translationKey: "_ERROR.RECORD.DUPLICATE",
    },
    services.ErrDateRangeOverlap: {
        status:         http.StatusConflict,
        translationKey: "_ERROR.DATERANGE.OVERLAP",
    },
    services.ErrInvalidConfiguration: {
        status:         http.StatusUnprocessableEntity,
        translationKey: "_ERROR.CONFIG.INVALID",
    },
    services.ErrExternalServiceDown: {
        status:         http.StatusServiceUnavailable,
        translationKey: "_ERROR.SERVICE.UNAVAILABLE",
    },
}
```

### 3. Centralized handleError Function

```go
func handleError(ctx *gin.Context, err error) bool {
    for sentinel, details := range detailsByError {
        if !errors.Is(err, sentinel) {
            continue
        }
        displayErr := err
        if details.displayError != nil {
            displayErr = details.displayError
        }
        customError := responses.CreateCustomError([]error{displayErr}, details.status)
        customError.TranslationKey = details.translationKey
        return responses.ResolveError(ctx, customError)
    }
    // Default: 500 for unmapped errors
    customError := responses.CreateCustomError([]error{err}, http.StatusInternalServerError)
    return responses.ResolveError(ctx, customError)
}
```

### 4. Usage in Handlers

```go
func (c *myController) GetEntity(ctx *gin.Context) {
    id := ctx.Param("id")
    if id == "" {
        responses.BadRequestError(ctx, errors.New("id is required"))
        return
    }
    result, err := c.service.GetEntity(ctx, id)
    if err != nil {
        handleError(ctx, err)
        return
    }
    ctx.JSON(http.StatusOK, result)
}
```

## Rules

### Services (Domain Layer)
- Return sentinel errors using `fmt.Errorf("context: %w", sentinelErr)` so `errors.Is()` works
- Never return raw `errors.New()` for conditions that need specific HTTP status codes
- Group sentinel errors in a dedicated `errors.go` file per service package
- Name errors with `Err` prefix: `ErrNotFound`, `ErrDuplicate`, `ErrInvalidInput`

### Controllers (HTTP Layer)
- Every controller must have an `error_mapping.go` with the `detailsByError` map
- Default fallback for unmapped errors must be `500`, not `400`
- Never hardcode HTTP status codes in handler methods — always use `handleError`
- Translation keys follow: `_ERROR.{DOMAIN}.{CONDITION}`

## Status Code Decision Tree

```
Is the request malformed (bad JSON, missing fields)?       → 400
Does the requested resource not exist?                     → 404
Does the operation conflict with existing data?            → 409
Is the request valid but fails business rules?             → 422
Is an external dependency unavailable?                     → 503
Is it an unexpected internal failure?                      → 500
```
