---
inclusion: fileMatch
fileMatchPattern: ["**/*Controller.java", "**/*Resource.java", "**/*Dto.java", "**/*DTO.java", "**/*Request.java", "**/*Response.java", "**/*Api.java", "**/*ApiConfig*.java", "**/SwaggerConfig*.java", "**/OpenApiConfig*.java", "**/WebMvcConfig*.java", "**/CorsConfig*.java"]
description: REST API design — resource naming, status codes, pagination, validation, versioning, documentation, CORS
---

# REST API Best Practices

> **Creating a new REST API from scratch?** Ask: *"Create a REST API for [resource]"* to invoke the `dlp-create-rest-api` skill with full step-by-step workflow, service layer, and mapper templates.

> **Confluence Reference**: [REST API Development - Guidelines and Best Practices](https://confluence.disney.com/spaces/DLPRATS/pages/1065246091/REST+API+development+-+Guidelines+and+Best+Practices)
>
> **Related Rules**:
> - `spring/spring-core.mdc` — DI, transactions, configuration, anti-patterns
> - `dlp/exception-handling.mdc` — RFC 7807 ProblemDetail, Foundation exceptions
> - `dlp/foundation-usage.mdc` — Foundation REST client for outgoing calls
> - `dlp/authorization.mdc` — OneId/AuthZ endpoint protection
> - `java/security.mdc` — OWASP (injection, XSS, SSRF)

---

## DLP Naming Patterns

Two standard URL patterns at DLP:

- **Guest API**: `/v1/guests/{swid}/resource-name/{resource-id}/sub-resource`
- **B2B API**: `/v1/resource-name/{resource-id}/sub-resource`

| Rule | Good | Bad |
|------|------|-----|
| Plural nouns in English | `/v1/payments` | `/v1/payment` |
| Spinal-case (kebab-case) paths | `/v1/disney-premier-access` | `/v1/disneyPremierAccess` |
| Spinal-case query params | `?visit-date=2024-01-01` | `?visitDate=2024-01-01` |
| Version prefix | `/v1/`, `/v2/` | `/payments` |
| Nouns, no verbs | `/v1/payments` | `/v1/createPayment` |
| Nested for relationships | `/v1/orders/{id}/items` | `/v1/order-items?orderId=x` |
| Max 2 levels sub-resources | `/v1/orders/{id}/items` | `/v1/.../items/{id}/details` |
| IDs in path, filters in query | `/v1/payments/{id}` | `/v1/payments?id=123` |
| No technical refs in URL | `/v1/packages` | `/v1/tbl-packages` |

---

## HTTP Methods & Status Codes

| Method | Path | Success Status | Use For |
|--------|------|----------------|---------|
| POST | `/v1/resources` | 201 CREATED | Create (+ `Location` header) |
| GET | `/v1/resources/{id}` | 200 OK | Read one |
| GET | `/v1/resources` | 200 OK | List / search |
| PUT | `/v1/resources/{id}` | 200 OK | Full replace |
| PATCH | `/v1/resources/{id}` | 200 OK | Partial update |
| DELETE | `/v1/resources/{id}` | 204 NO_CONTENT | Delete |

### Status Code Reference

| Family | Codes | Usage |
|--------|-------|-------|
| **2xx Success** | 200 OK, 201 Created, 202 Accepted, 204 No Content, 206 Partial Content | |
| **4xx Client Error** | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 406 Not Acceptable | |
| **5xx Server Error** | 500 Internal Server Error | |

- **202 Accepted** — use for async operations where processing continues in background
- **206 Partial Content** — use for search results or partial data responses

---

## Controller Pattern

> This is a condensed reference pattern. For the full hexagonal template (with DTO mapper, value objects, and service layer), use the `dlp-create-rest-api` skill.

```java
@RestController
@RequestMapping(value = "/v1/payments", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Payments", description = "Payment lifecycle operations")
public class PaymentController {
    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = Objects.requireNonNull(service);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create payment")
    @ApiResponse(responseCode = "201", content = @Content(schema = @Schema(implementation = PaymentResponse.class)))
    @ApiResponse(responseCode = "400", content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    public ResponseEntity<PaymentResponse> create(@Valid @RequestBody CreatePaymentRequest request) {
        PaymentResponse response = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<PaymentResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping
    @Operation(summary = "List payments")
    public ResponseEntity<Page<PaymentResponse>> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "payment-status", required = false) PaymentStatus status) {
        return ResponseEntity.ok(service.findAll(status, pageable));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
```

---

## DTO Pattern

```java
public record CreatePaymentRequest(
    @NotBlank @Size(max = 100) @Schema(description = "Payer name", example = "John Doe")
    String name,
    @NotNull @Positive @Schema(description = "Amount in cents", example = "4999")
    Long amountCents
) {}

public record PaymentResponse(
    @Schema(description = "Payment ID", example = "12345") Long id,
    @Schema(description = "Payer name", example = "John Doe") String name,
    @Schema(description = "Amount in cents", example = "4999") Long amountCents,
    @Schema(description = "Payment status", example = "COMPLETED") String status,
    @Schema(description = "Creation timestamp") Instant createdAt
) {}
```

---

## Controller Key Rules

- **`produces = APPLICATION_JSON_VALUE`** on `@RequestMapping`, **`consumes`** on write endpoints
- **`@Valid` on every `@RequestBody`** — never trust client input
- **POST → 201 + `Location` header**, **DELETE → 204** (no body)
- **No business logic in controllers** — delegate to service / use case handler
- **Spinal-case query params** — use `@RequestParam(name = "my-param")` to map to Java names
- **DTOs as records** — never expose JPA entities as REST responses
- **`@Schema(description, example)`** on all DTO fields
- **Validation annotations** on request DTOs (`@NotBlank`, `@Size`, `@Positive`, `@Pattern`)
- **`@Size(max=)`** on large text fields and collections to prevent DoS

---

## Collection Response Wrapping

**Always wrap collections in an object** — never return raw JSON arrays.

```java
// BAD — raw array: can't add metadata later without breaking clients
public List<PaymentResponse> list() { ... }

// GOOD — wrapped: extensible, includes pagination metadata
public Page<PaymentResponse> list(@PageableDefault Pageable pageable) { ... }
```

Why: raw arrays can't be extended with metadata, are vulnerable to JSON hijacking, and prevent consistent response structure.

---

## Pagination

```properties
# MANDATORY — prevent DoS via ?size=999999
spring.data.web.pageable.max-page-size=100
spring.data.web.pageable.default-page-size=20
```

| Rule | Guideline |
|------|-----------|
| **Max page size** | Always enforce (e.g., 100) — **never allow unbounded size** |
| **Default page size** | 20 via `@PageableDefault` |
| **Default sort** | Always define (e.g., `createdAt,desc`) |
| **Return `Page<T>`** | Includes `totalElements`, `totalPages` — clients need this |
| **Cursor-based** | Use for very large datasets (>100K rows) — keyset pagination |
| **Wrap collections** | Always return objects, never raw JSON arrays |

---

## Filtering & Sorting

```
GET /v1/payments?status=COMPLETED&created-after=2024-01-01&sort=amount,desc&page=0&size=20
```

| Convention | Example | Why |
|------------|---------|-----|
| Spinal-case param names | `?created-after=` | DLP standard |
| Comma-separated sort | `?sort=name,asc` | Spring Data convention |
| ISO 8601 dates | `?created-after=2024-01-01` | Unambiguous |
| Enum values uppercase | `?status=ACTIVE` | Matches Java enums |

### Filtering Patterns

| Pattern | Example |
|---------|---------|
| Single criteria, single value | `?type=axial` |
| Multiple criteria | `?type=axial&activity=true` |
| Multi-value (comma-separated) | `?ids=1234,5678` |
| Alias for frequent queries | `/v1/incidents/closed` instead of `?status=CLOSED` |

Reserved query words: `sort`, `first`, `next`, `last`, `link`, `asc`, `desc`, `page`, `size`

Use `@RequestParam(name = "my-param", required = false)` for optional filters. For complex filtering, use Spring Data `Specification<T>`.

### Partial Data (Field Selection)

Support returning only requested fields using the `fields` query parameter:

```
GET /v1/assets/1234?fields=code,label,road(code)
```

This reduces payload size and improves performance. Support up to two levels of nested field selection.

### Search

For search endpoints, use a dedicated sub-path:

```
GET /v1/resources/search?label=ouv*
GET /v1/search?q=keywords
```

Return `206 Partial Content` for search results with metadata:

```json
{
  "count": 5,
  "query": "label=ouv*",
  "results": [...]
}
```

---

## API Versioning

URL path versioning is the DLP standard: `/v1/payments`

**Maintain max 2 versions** of an API: the current one and the previous one.

| Change Type | Bump Version? |
|-------------|:-------------:|
| Add optional field to response | No |
| Add new endpoint | No |
| Add optional query parameter | No |
| Remove or rename a field | **Yes → v2** |
| Change field type | **Yes → v2** |
| Remove an endpoint | **Yes → v2** |
| Change error response format | **Yes → v2** |

**Deprecation**: Use `@Deprecated`, add `Sunset` + `Deprecation` + `Link` headers to responses, document in `@Tag` with removal date.

### REST Breaking Change Remediation Guidance

When flagging a **REST API breaking change** in review, recommend in **Suggested Fix** or **Why This Matters**:

| Breaking change type | Remediation to recommend |
|----------------------|---------------------------|
| Remove/rename field, remove endpoint, change response format | **Bump version path** — expose under `/v2/...`; keep `/v1/...` until sunset. |
| Deprecating an endpoint | **Sunset + Deprecation headers** — `Sunset: <date>`, `Deprecation: true`, `Link` to new endpoint or docs; document in OpenAPI `@Tag` with removal date. |
| Change that affects existing clients | **Document migration** — add migration notes in OpenAPI description, changelog, or `Link` header to migration guide. |

Max 2 versions maintained (current + previous). When introducing v2, set sunset date for v1 and communicate to consumers.

---

## HATEOAS (Optional)

HATEOAS (**H**ypermedia **A**s **T**he **E**ngine **O**f **A**pplication **S**tate) enables clients to navigate APIs dynamically through links in responses.

```json
{
  "id": "1234",
  "name": "My Resource",
  "_links": {
    "self": "/v1/resources/1234",
    "items": "/v1/resources/1234/items"
  }
}
```

| Guideline | Detail |
|-----------|--------|
| Use HAL format | `application/hal+json` content type |
| Include `self` link | Always link to the resource itself |
| Include related links | Link to sub-resources and available actions |
| Reduces client coupling | Clients discover navigation dynamically |

> HATEOAS is optional at DLP but recommended for APIs exposed to external consumers.

---

## Async Requests / Webhooks

For long-running processes, use asynchronous communication:

1. Client sends request with a `callbackUrl`
2. Server returns `202 Accepted` immediately
3. Server processes asynchronously and calls back the client

```
POST /v1/reports/generate
→ 202 Accepted
   Location: /v1/reports/status/abc-123
```

Use this pattern for complex orchestrations, long computations, or transactional processes.

---

## Non-Resource Operations

Some operations don't map to resource CRUD (translations, conversions, business actions).
Use **POST with a verb**:

```
POST /v1/mail/42/send
POST /v1/convert?from=EUR&to=USD&amount=42
```

This is the only case where a verb is allowed in the URL. The operation must be represented by a verb, not a noun.

---

## CORS

| Rule | Why |
|------|-----|
| **Never `allowedOrigins("*")` on authenticated endpoints** | Any website can make credentialed requests |
| **Explicit `allowedMethods`** | Don't expose methods you don't support |
| **Expose `Location` and `ETag` headers** | Clients need these for 201 and caching |
| **Prefer global `WebMvcConfigurer` over `@CrossOrigin`** | Consistent, easier to audit |
| **Set `maxAge` for preflight caching** | Reduces OPTIONS requests |

> **DLP services behind API Gateway**: If CORS is handled at gateway level, mark N/A.

---

## API Documentation (Swagger / OpenAPI)

| Element | Required | Annotation |
|---------|:--------:|------------|
| Controller tag | Yes | `@Tag(name, description)` |
| Operation summary | Yes | `@Operation(summary)` |
| Security requirement | Yes (protected) | `@SecurityRequirement` |
| Success response + schema | Yes | `@ApiResponse(responseCode, content = @Content(schema = ...))` |
| Error responses (400, 401, 403, 404, 500) | Yes | `@ApiResponse` per status |
| DTO field descriptions | Yes | `@Schema(description, example)` |
| OpenAPI config bean | Yes | `OpenAPI` bean with title, version, security scheme |

### SpringDoc and actuator in OpenAPI (`springdoc.show-actuator`)

When **`springdoc.show-actuator=true`** (Spring property; YAML equivalent), SpringDoc can **include actuator endpoints in the generated OpenAPI document**. That widens what appears under Swagger UI and `/v3/api-docs` (paths, operational metadata). Risk is **reachability of the docs**, not the flag alone.

**Untrusted or public docs surface:** If **Swagger UI** / **`/v3/api-docs`** are reachable from the **internet** or **untrusted** callers (same ingress as public app traffic, no network separation), including actuator in the spec is **undesirable** — align with **`dlp/authorization.mdc`** (OpenAPI exposure) and treat as a real **disclosure / misconfiguration** issue by severity.

**Review calibration — internal-only API docs (do not over-flag):** If Swagger/OpenAPI is **only** on an **internal** path (e.g. cluster-internal, management port, VPN/admin URL per platform policy — **not** public guest/B2B ingress) and a **short justification** exists (comment on the property line, runbook, or ADR), **`springdoc.show-actuator=true`** is **accepted** for operator-facing catalogs.

**Reviewers:**

- **Do not** report 🟡 **MEDIUM** Security **solely** for `springdoc.show-actuator=true` when the above **internal-only + documented justification** applies.
- If **whether docs are public is unclear** from the repo, prefer 🟢 **LOW** — e.g. **“Verify: Swagger/OpenAPI not on public ingress”** — rather than defaulting to MEDIUM “hygiene.”
- **Still report** 🟡 **MEDIUM** (or higher, per exposure and **`dlp/authorization.mdc`**) when OpenAPI/Swagger **is** on a **public** or **untrusted** surface **and** actuator is included in the spec.

**Source:** For this narrow topic, cite **`spring/rest-api.mdc`** (this section), **not** **`dlp/security-pii.mdc`**, as the **primary** rule when the only finding is “show-actuator is true” under an internal-only docs posture.

---

## Error Response Format

> See `dlp/exception-handling.mdc` for Foundation exceptions, RFC 7807 ProblemDetail, and error handling patterns.

- All errors use **RFC 7807 ProblemDetail** format (via Foundation's `AbstractProblemDetailExceptionHandler`)
- Include `ProblemDetail` schema in `@ApiResponse` for all 4xx/5xx status codes
- Error content must be explicit to help support — never expose stack traces or sensitive data

---

## REST API Anti-Patterns

| Anti-Pattern | What to look for | Why it's wrong |
|---|---|---|
| JPA `@Entity` in controller method signatures | Controller returns or accepts entities | Leaks persistence model; bypasses DTO validation |
| Missing `@Valid` on `@RequestBody` | POST/PUT/PATCH without `@Valid` | Bean Validation not enforced |
| Missing `@Size` / max limits on strings or collections | Large text or list fields without bounds | DoS via huge payloads |
| Raw JSON array as top-level response | `List<X>` returned without wrapper object | Breaks DLP response envelope; harder to evolve |
| Verb in URL path | `/v1/createOrder`, `/v1/getUser` | Should use nouns + HTTP verbs |
| `allowedOrigins("*")` with credentials | `WebMvcConfigurer` or `@CrossOrigin` | Credential theft / CSRF-style abuse |
| Sensitive IDs or PII in query string | `?email=`, `?ssn=` | Logged by proxies, browser history |
| Undocumented endpoints | No `@Operation`, missing `@ApiResponse` for errors | Clients and reviewers cannot verify contract |
| Unbounded pagination | No `max-page-size`, client can request huge pages | DB and memory pressure |

---

## Checklist

### Endpoint Design
- [ ] URLs follow DLP naming pattern (Guest API or B2B API)
- [ ] HTTP methods match semantics (POST=create, GET=read, PUT=replace, DELETE=remove)
- [ ] Status codes correct (201 POST, 204 DELETE)
- [ ] POST returns `Location` header
- [ ] URLs: plural nouns, spinal-case, versioned (`/v1/...`), no verbs, max 2 nesting levels

### Request Handling
- [ ] `@Valid` on every `@RequestBody`
- [ ] Validation annotations on all request DTO fields
- [ ] `@Size(max=)` on large text fields and collections (DoS)
- [ ] `consumes = APPLICATION_JSON_VALUE` on write endpoints
- [ ] Query params use spinal-case via `@RequestParam(name = "...")`

### Response Design
- [ ] Collections wrapped in objects (never raw JSON arrays)
- [ ] DTOs as records (never expose JPA entities)
- [ ] No business logic in controllers
- [ ] Errors use RFC 7807 ProblemDetail

### Pagination & Filtering
- [ ] Max page size enforced (`spring.data.web.pageable.max-page-size`)
- [ ] Default page size and sort via `@PageableDefault`
- [ ] Multi-value filters use comma-separated syntax (`?ids=1,2,3`)
- [ ] Search endpoints use `/search?q=` pattern (if applicable)

### Versioning
- [ ] URL path versioning (`/v1/...`)
- [ ] Max 2 versions maintained (current + previous)
- [ ] Deprecated endpoints have `Sunset` header

### Documentation (Swagger/OpenAPI)
- [ ] `@Tag` on controllers, `@Operation(summary)` on endpoints
- [ ] `@ApiResponse` for all status codes (success + errors)
- [ ] `@SecurityRequirement` on protected endpoints
- [ ] `@Schema(description, example)` on DTO fields
- [ ] OpenAPI config bean with title, version, security scheme
- [ ] If `springdoc.show-actuator=true`: internal-only reachability of Swagger/`v3/api-docs` is intentional and noted (comment/runbook), or actuator omitted from public docs — see **SpringDoc and actuator in OpenAPI** above

### Advanced Patterns
- [ ] Non-resource operations use POST with verb (`/v1/mail/42/send`)
- [ ] Async operations return `202 Accepted` (if applicable)
- [ ] HATEOAS links included (if exposed to external consumers)
- [ ] Partial data `?fields=` supported (if applicable)

### Security
- [ ] CORS explicitly configured (never `allowedOrigins("*")` on auth endpoints)
- [ ] No sensitive data in URL query parameters
- [ ] `produces = APPLICATION_JSON_VALUE` on controllers
