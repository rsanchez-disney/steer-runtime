# Clean Architecture Guidelines for Python FastAPI Projects

## Overview

This document defines the Clean Architecture conventions for Python projects using FastAPI. All AI agents (Kiro, Copilot, Claude Code, Antigravity) must follow these guidelines when generating, modifying, or reviewing code.

## SOLID Principles Applied

| Principle                 | Application                                                                                                                                                     |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Single Responsibility** | Each class has one reason to change. Use cases contain only orchestration logic. Repositories only handle persistence. Providers only handle external services. |
| **Open/Closed**           | Extend behavior by adding new implementations, not modifying existing use cases. New providers/repositories implement existing interfaces.                      |
| **Liskov Substitution**   | Any implementation of an interface can replace another without breaking the use case.                                                                           |
| **Interface Segregation** | Small, focused interfaces. One interface per responsibility (e.g., `ISecretsProvider` only stores secrets, not reads them).                                     |
| **Dependency Inversion**  | Use cases depend on abstractions (interfaces), not concrete classes. Infrastructure depends on application interfaces, not the other way around.                |

## Folder Structure

```text
module_name/
├── application/                    # Business logic layer
|   ├── __init__.py                 # Exports all use cases
│   ├── interfaces/                 # Abstractions (contracts)
│   │   ├── __init__.py
│   │   ├── clients/               # External API client interfaces
│   │   │   └── some_client.py
│   │   ├── providers/             # Service provider interfaces
│   │   │   └── secrets_provider.py
│   │   └── repositories/          # Data access interfaces
│   │       └── user_repository.py
│   └── use_cases/                  # Business logic orchestration
│       ├── __init__.py             # Exports all use cases
│       ├── use_case.py             # Abstract base UseCase class
│       └── rotate_passwords_use_case.py
├── domain/                         # Core business entities and rules
│   ├── __init__.py
│   ├── constants.py                # Domain constants and thresholds
│   ├── entities/                   # Domain models (Pydantic BaseModel)
│   │   ├── __init__.py
│   │   └── functional_user.py
│   ├── enums/                      # Domain enumerations
│   │   └── some_enum.py
│   └── dtos/                       # Data transfer objects
│       └── some_dto.py
├── infrastructure/                 # External world implementations
│   ├── __init__.py
│   ├── clients/                    # HTTP/API client implementations
│   │   └── atlas/
│   │       └── database_user.py
│   ├── providers/                  # Service provider implementations
│   │   └── aws/
│   │       └── aws_secrets_provider.py
│   └── repositories/              # Database implementations
│       └── user_repository.py
├── di/                             # Dependency Injection wiring
│   ├── __init__.py
│   └── deps.py                     # FastAPI Depends providers
├── presentation/                   # HTTP layer (controllers)
│   ├── __init__.py
│   ├── routers/
│   │   └── router.py              # FastAPI route handlers
│   └── schemas/                    # Request/Response models
│       └── requests/
│           └── some_input.py
└── __init__.py
```

## Layer Responsibilities

### Domain Layer (`domain/`)

- **Contains**: Entities, value objects, enums, constants, domain exceptions
- **Depends on**: Nothing (innermost layer)
- **Rules**:
  - No imports from `application/`, `infrastructure/`, or `presentation/`
  - Entities are Pydantic `BaseModel` with `model_config = ConfigDict(populate_by_name=True)` when using aliases
  - Constants are module-level `Final` values or class attributes
  - No I/O, no side effects

### Application Layer (`application/`)

- **Contains**: Use cases, interface definitions
- **Depends on**: `domain/` only
- **Rules**:
  - Use cases receive dependencies via constructor injection (never instantiate infrastructure directly)
  - Use cases return `UseCaseOutput` from `dpe_common`
  - Interfaces define contracts that infrastructure must fulfill
  - No imports from `infrastructure/` or `presentation/`
  - Use cases handle errors gracefully and never let infrastructure exceptions leak unhandled

### Infrastructure Layer (`infrastructure/`)

- **Contains**: Concrete implementations of interfaces
- **Depends on**: `application/interfaces/`, `domain/`
- **Rules**:
  - Implements interfaces from `application/interfaces/`
  - Contains all I/O: database queries, HTTP calls, file system, AWS SDK
  - May import third-party libraries (boto3, pymongo, httpx)
  - Never imported by `application/` or `domain/`

### Presentation Layer (`presentation/`)

- **Contains**: Routers, request/response schemas
- **Depends on**: `application/` (use cases), `di/`
- **Rules**:
  - Thin handlers: validate input, call use case, return response
  - No business logic in routers
  - Uses FastAPI `Depends` for DI

### DI Layer (`di/`)

- **Contains**: Dependency injection wiring (provider functions)
- **Depends on**: `infrastructure/`, `application/`
- **Rules**:
  - Each provider function creates one concrete dependency
  - Uses `Annotated[Type, Depends(provider_function)]` pattern
  - All imports at the top of the file (no local imports inside functions)
  - For scheduler/cron contexts (outside HTTP): call provider functions directly passing their dependencies manually

## Interface Approaches

This project supports two approaches for defining interfaces. Choose one per project and be consistent.

---

### Option A: ABC (Abstract Base Classes)

Use `abc.ABC` with `@abstractmethod`. This is the classical Python approach.

```python
from abc import ABC, abstractmethod

class ISecretsProvider(ABC):
    """Interface for storing credentials."""

    @abstractmethod
    def store_credentials(self, secret_name: str, secret_value: dict[str, str]) -> None:
        """Stores or updates credentials in the vault."""
```

**Implementation:**

```python
class AwsSecretsProvider(ISecretsProvider):
    def store_credentials(self, secret_name: str, secret_value: dict[str, str]) -> None:
        pass  # concrete implementation
```

**Pros**: Explicit inheritance, clear error at class definition if method is missing.
**Cons**: Requires inheritance (`class Impl(IInterface)`).

**No additional tooling required** — ABC violations are caught at instantiation time.

---

### Option B: typing.Protocol (Structural Typing)

Use `typing.Protocol` for duck-typing interfaces. No inheritance needed.

```python
from typing import Protocol

class SecretsProvider(Protocol):
    """Interface for storing credentials."""

    def store_credentials(self, secret_name: str, secret_value: dict[str, str]) -> None: ...
```

**Implementation** (no inheritance needed):

```python
class AwsSecretsProvider:
    def store_credentials(self, secret_name: str, secret_value: dict[str, str]) -> None:
        pass # concrete implementation — satisfies the Protocol structurally
```

**Pros**: No coupling via inheritance, more Pythonic, better for third-party class adaptation.
**Cons**: Violations only detected by mypy (not at runtime).

**When choosing Protocol, you MUST configure mypy in pre-commit** to validate conformance:

#### Required `.pre-commit-config.yaml` addition

```yaml
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.11.0
    hooks:
      - id: mypy
        additional_dependencies:
          - pydantic
          - types-requests
        args:
          - --strict
          - --check-untyped-defs
          - --disallow-untyped-defs
          - --warn-return-any
          - --warn-unused-configs
          - --enable-error-code=truthy-bool
```

#### Required `mypy.ini` or `pyproject.toml` section

```toml
[tool.mypy]
python_version = "3.12"
strict = true
plugins = ["pydantic.mypy"]
disallow_untyped_defs = true
check_untyped_defs = true
warn_return_any = true
warn_unused_configs = true

[[tool.mypy.overrides]]
module = "dpe_common.*"
ignore_missing_imports = true
```

This ensures that if a class claims to implement a Protocol but has a mismatched signature, the pre-commit check will fail.

---

## Dependency Injection Rules

### In FastAPI endpoints (HTTP context)

```python
@with_logging
def get_repository(
    database_connection: Annotated[Database, Depends(get_database_connection)],
) -> IRepository:
    return ConcreteRepository(database_connection)

@with_logging
def get_use_case(
    repository: Annotated[IRepository, Depends(get_repository)],
    provider: Annotated[IProvider, Depends(get_provider)],
) -> MyUseCase:
    return MyUseCase(repository=repository, provider=provider)
```

### In scheduler/cron (non-HTTP context)

```python
# Call the same provider functions directly, resolving dependencies manually
use_case = MyUseCase(
    repository=get_repository(get_database_connection()),
    provider=get_provider(),
)
await use_case.execute(params=None)
```

## Use Case Pattern

```python
class SomeUseCase(UseCase):
    def __init__(self, repository: IRepository, provider: IProvider):
        self.repository = repository
        self.provider = provider

    async def execute(self, params: Any) -> UseCaseOutput:
        try:
            # 1. Query data
            # 2. Apply business rules
            # 3. Call external services via injected abstractions
            # 4. Persist results
            return UseCaseOutput(message="...", status_code=200)
        except Exception as e:
            return UseCaseOutput(message="...", status_code=500, json_data={"error": repr(e)})
```

## Testing Rules

- Mock all dependencies at the interface boundary
- Use `MagicMock()` for synchronous interfaces, `AsyncMock()` for async
- Follow Given-When-Then pattern
- Patch external classes (`PasswordBuilder`, etc.) at the module path
- Never test infrastructure logic in use case tests
- Use `@pytest.fixture` for all test dependencies

## Factory + Strategy Pattern in Clean Architecture

When a use case needs to select behavior at runtime (e.g., cloud provider for encryption, private endpoint type, secrets vault backend), use the **Factory + Strategy** pattern:

### Where each piece lives

| Component                | Layer                                       | Purpose                                                                      |
|--------------------------|---------------------------------------------|------------------------------------------------------------------------------|
| Strategy interface       | `application/interfaces/providers/`         | Abstract contract (e.g., `ICloudEncryptionProvider`)                         |
| Strategy implementations | `infrastructure/providers/`                 | Concrete behaviors (e.g., `AwsEncryptionProvider`, `GcpEncryptionProvider`)  |
| Factory interface        | `application/interfaces/providers/`         | Abstract factory contract (e.g., `ICloudEncryptionFactory`)                  |
| Factory implementation   | `infrastructure/providers/` or `di/deps.py` | Selects strategy based on input                                              |
| Use case                 | `application/use_cases/`                    | Receives the factory or strategy, uses it without knowing the concrete cloud |

### Example: Multi-cloud encryption provisioning

**Strategy interface** (`application/interfaces/providers/cloud_encryption.py`):

```python
from abc import ABC, abstractmethod
from typing import Any

class ICloudEncryptionProvider(ABC):
    @abstractmethod
    def create_encryption_key(self, project_name: str, region: str) -> str:
        """Creates a cloud-native encryption key and returns its ARN/ID."""

    @abstractmethod
    def configure_key_policy(self, key_id: str, atlas_role_arn: str) -> None:
        """Configures the key policy to allow MongoDB Atlas access."""
```

**Factory interface** (`application/interfaces/providers/cloud_encryption_factory.py`):

```python
from abc import ABC, abstractmethod
from .cloud_encryption import ICloudEncryptionProvider

class ICloudEncryptionFactory(ABC):
    @abstractmethod
    def create(self, provider_name: str, region: str) -> ICloudEncryptionProvider:
        """Returns the appropriate encryption provider for the given cloud."""
```

**Strategy implementations** (`infrastructure/providers/`):

```python
# infrastructure/providers/aws/aws_encryption_provisioner.py
class AwsEncryptionProvider(ICloudEncryptionProvider):
    def __init__(self, aws_adapter: AwsAdapter):
        self._aws_adapter = aws_adapter

    def create_encryption_key(self, project_name: str, region: str) -> str:
        return self._aws_adapter.aws_kms_manager.create_key(project_name, region)

    def configure_key_policy(self, key_id: str, atlas_role_arn: str) -> None:
        self._aws_adapter.aws_kms_manager.put_key_policy(key_id, atlas_role_arn)

# infrastructure/providers/gcp/gcp_encryption_provisioner.py
class GcpEncryptionProvider(ICloudEncryptionProvider):
    def __init__(self, gcp_adapter: GcpAdapter, service_account_key: str):
        self._gcp_adapter = gcp_adapter
        self._service_account_key = service_account_key

    def create_encryption_key(self, project_name: str, region: str) -> str:
        return self._gcp_adapter.create_kms_key(project_name, region)

    def configure_key_policy(self, key_id: str, atlas_role_arn: str) -> None:
        self._gcp_adapter.set_key_iam_policy(key_id, self._service_account_key)
```

**Factory in DI** (`di/deps.py`):

```python
@with_logging
def get_encryption_provider_module(
    cloud_adapter: Annotated[AwsAdapter | GcpAdapter, Depends(get_cloud_adapter)],
    domain: Annotated[DomainType, Header()] = DomainType.IO,
) -> ICloudEncryptionProvider:
    match cloud_adapter:
        case AwsAdapter():
            return AwsEncryptionProvider(cloud_adapter)
        case GcpAdapter():
            service_account_key = get_gcp_kms_service_account(domain)
            return GcpEncryptionProvider(cloud_adapter, service_account_key)
        case _:
            raise FunctionalException("Unsupported cloud provider")
```

**Use case** (only knows the interface):

```python
class ConfigureEncryptionUseCase(UseCase):
    def __init__(
        self,
        cloud_provider_access_client: ICloudProviderAccessClient,
        encryption_at_rest_client: IEncryptionAtRestClient,
        encryption_provider: ICloudEncryptionProvider,  # ← injected strategy
    ):
        self.encryption_provider = encryption_provider
        # ...

    async def execute(self, params: EncryptionParams) -> UseCaseOutput:
        key_id = self.encryption_provider.create_encryption_key(params.project_name, params.region)
        self.encryption_provider.configure_key_policy(key_id, params.atlas_role_arn)
        # ... use case doesn't know if it's AWS KMS or GCP Cloud KMS
```

### How to extend (Open/Closed)

To add Azure Key Vault encryption support:

1. Create `infrastructure/providers/azure/azure_encryption_provisioner.py` implementing `ICloudEncryptionProvider`
2. Add a new `case AzureAdapter():` branch in the DI factory (`deps.py`)
3. **No changes to the use case**

### DI wiring for Factory pattern (`di/deps.py`)

```python
def get_cloud_private_endpoint_provisioner(
    request: ProvisioningInput,
) -> ICloudPrivateEndpointProvider:
    provisioning_input = request.root
    if provisioning_input.provider_name is CloudProviderEnum.AWS:
        return AwsCloudPrivateEndpointProvider(aws_adapter=AwsAdapter(...))
    if provisioning_input.provider_name is CloudProviderEnum.GCP:
        return MultiCloudPrivateEndpointProvider(gcp_cross_domain_adapter=...)
    raise FunctionalException("Unsupported cloud provider")
```

## Anti-Patterns (DO NOT)

- ❌ Import infrastructure classes inside use cases
- ❌ Instantiate concrete classes inside use cases (use constructor injection)
- ❌ Put business logic in routers
- ❌ Use local imports inside DI provider functions
- ❌ Let use cases know about AWS, MongoDB driver, or HTTP client specifics
- ❌ Skip error handling in use cases (always return UseCaseOutput)
- ❌ Mix camelCase/snake_case without Pydantic aliases
- ❌ Omit `populate_by_name=True` in entities with aliases
- ❌ Put strategy selection logic (if/else for choosing implementation) inside the use case
- ❌ Register new strategies by modifying use case code

---

## Module and Import Conventions

### One Class Per Module

Every module must contain a single class. That class must be imported in the corresponding package `__init__.py` so that consumers import from the package level, not the module level.

```python
# api/dns/services/interfaces/i_dns_provider.py
class IDnsProvider(ABC):
    ...

# api/dns/services/interfaces/__init__.py
from api.dns.services.interfaces.i_dns_provider import IDnsProvider

# Consumer usage — always import from package level
from api.dns.services.interfaces import IDnsProvider  # correct
# from api.dns.services.interfaces.i_dns_provider import IDnsProvider  # avoid
```

---

## Type Hints

### General Rules

- All variables, function arguments, and return values must be typed correctly.
- Prefer built-in types in lowercase: `list`, `dict`, `set`, `tuple`, `str`, `int`, `float`, `bool`.
- Do **not** import `List`, `Dict`, `Set`, `Tuple` from `typing`. Use their built-in lowercase equivalents.
- For specialized abstract types (`Generator`, `Collection`, `Mapping`, `AsyncGenerator`, etc.), import from `collections.abc` — this is the recommended standard since Python 3.11+.
- Use the pipe `|` operator for optional/union types. Do **not** use `typing.Optional` or `typing.Union`.

```python
# Correct
def get_user(user_id: str) -> UserResponse | None: ...
def list_items(filters: dict[str, str]) -> list[ItemDTO]: ...

# Incorrect
from typing import Optional, List, Dict
def get_user(user_id: str) -> Optional[UserResponse]: ...
def list_items(filters: Dict[str, str]) -> List[ItemDTO]: ...
```

### Dictionaries and Nested Structures

- If a dictionary is deeply nested, try to type its inner layers as precisely as possible.
- `dict[str, Any]` is acceptable only when the inner structure is truly dynamic or unknown.

```python
# Prefer explicit typing
config: dict[str, list[dict[str, int]]] = ...

# Acceptable only when truly dynamic
metadata: dict[str, Any] = ...
```

### Annotated for Pydantic 2.0+

Use `Annotated` as the preferred approach for Pydantic model field definitions:

```python
from typing import Annotated
from pydantic import Field

class CreateUserRequest(ExampleModelMixin):
    """Request schema for user creation."""

    name: Annotated[str, Field(description="Full name of the user", min_length=1, max_length=100, examples=["John Doe"])]
    email: Annotated[str, Field(description="User email address", pattern=r"^[\w.-]+@[\w.-]+\.\w+$", examples=["john@example.com"])]
    age: Annotated[int | None, Field(default=None, description="User age in years", ge=0, le=150, examples=[30])]
```

---

## Async Programming

- Prefer async programming whenever a third-party library provides an async client/provider.
- If no async alternative exists, use the synchronous version — do **not** wrap it with `asyncio` built-in utilities unless absolutely necessary.
- `asyncio.gather` is reserved exclusively for orchestration use cases that need to run multiple independent operations concurrently. Do not use it elsewhere.

```python
# Correct: orchestration use case using gather
class FetchAllDataUseCase(UseCase):
    async def execute(self, request: FetchRequest) -> FetchResponse:
        users, orders = await asyncio.gather(
            self._user_provider.get_users(),
            self._order_provider.get_orders(),
        )
        return FetchResponse(users=users, orders=orders)
```

---

## Docstrings

### Format: Google Style

All docstrings must follow Google style with mandatory sections as applicable.

### Where Docstrings Are Required

| Element                                                                       | Required                                 | Notes                                           |
|-------------------------------------------------------------------------------|------------------------------------------|-------------------------------------------------|
| Classes (models, enums, services, providers, use cases, schemas, dataclasses) | Yes                                      | Always                                          |
| Functions and methods                                                         | Yes                                      | Always                                          |
| `__init__` methods                                                            | Only if a parameter requires explanation | Skip for straightforward DI constructors        |
| Interface methods                                                             | Yes                                      | Define the contract here                        |
| Overridden methods (infrastructure implementing interface)                    | No                                       | The interface docstring serves as documentation |
| New protected/private methods in infrastructure                               | Yes                                      | These are not overrides                         |
| Unit test classes                                                             | No                                       | Unless extremely necessary                      |
| Unit test methods                                                             | No                                       | Unless extremely necessary                      |
| Fixtures (`@pytest.fixture`)                                                  | Yes                                      | Always document fixtures                        |

### Docstring Structure

```python
def create_dns_record(
    self,
    zone_id: str,
    record_name: str,
    record_type: str,
    ttl: int = 300,
) -> DnsRecord:
    """Create a DNS record in the specified zone.

    Args:
        zone_id (str): The unique identifier of the DNS zone.
        record_name (str): The fully qualified domain name for the record.
        record_type (str): The DNS record type (A, CNAME, TXT, etc.).
        ttl (int): Time-to-live in seconds. Defaults to 300.

    Returns:
        DnsRecord: The newly created DNS record with its assigned ID.

    Raises:
        DnsZoneNotFoundError: When the specified zone_id does not exist.
        DnsRecordConflictError: When a record with the same name and type already exists.

    Notes:
        The record is created in a pending state and may take up to 60 seconds
        to propagate across all nameservers.
    """
```

### Rules for Docstring Sections

- **Summary**: First line, concise description of what the function does.
- **Args**: Each argument with its type hint in parentheses and a description. Mandatory for all parameters.
- **Returns**: The return type and a description of what is returned.
- **Raises**: Each exception type with a description of when it is raised. Include only if the function raises exceptions.
- **Notes**: Additional context if needed. Use sparingly.

### Router/Endpoint Docstrings

Endpoint operation docstrings serve as both the summary and description in Swagger UI. Format the summary line with `**bold**`:

```python
@router.post(
    "/{zone_id}/records",
    status_code=status.HTTP_201_CREATED,
    response_model=CreateDnsRecordResponse,
)
async def create_dns_record(
    zone_id: Annotated[str, Path(description="The DNS zone identifier")],
    request: CreateDnsRecordRequest,
    use_case: Annotated[CreateDnsRecordUseCase, Depends(provide_create_dns_record_use_case)],
) -> CreateDnsRecordResponse:
    """**Create a DNS record in a zone. Creates a new DNS record of the specified type within the given zone. The record enters a pending state until propagation completes.**

    Args:
        zone_id (str): The DNS zone identifier.

    Returns:
        CreateDnsRecordResponse: The created DNS record details.

    Raises:
        HTTPException: When the zone is not found (404) or a conflict occurs (409).

    \f
        request (CreateDnsRecordRequest): The record creation payload.
        use_case (CreateDnsRecordUseCase): Injected use case for record creation.
    """
```

The form feed character (`\f`) separates the Swagger-visible description from internal documentation. Place it after the user-facing description and before `Args` to hide DI parameters (like `use_case`) or non-required user parameters from the OpenAPI spec and Swagger UI render.

---

## Router Conventions

### Decorator Configuration

- The `summary` parameter is **not required** at the router decorator — the function docstring automatically provides the summary and description.
- `status_code` and `response_model` are mandatory (when applicable to the endpoint).
- Use the `responses` attribute at the router verb decorator for custom response specifications to enhance Swagger UI metadata.

### Parameter Typing

All router function parameters must be typed with their class and their FastAPI parameter type (`Path`, `Query`, `Header`, `Body`):

```python
from fastapi import Path, Query, Header, Body, Depends, status

@router.get(
    "/{project_id}/instances",
    status_code=status.HTTP_200_OK,
    response_model=ListInstancesResponse,
)
async def list_instances(
    project_id: Annotated[str, Path(description="The GCP project identifier")],
    region: Annotated[str | None, Query(description="Filter by region")],
    x_request_id: Annotated[str | None, Header(description="Correlation ID for tracing")],
    use_case: Annotated[ListInstancesUseCase, Depends(provide_list_instances_use_case)],
) -> ListInstancesResponse:
    """**List Cloud SQL instances for a project.**
    ...
    """
```

### Status Codes

Import status codes from `fastapi`, not from `starlette`:

```python
# Correct
from fastapi import status
status.HTTP_200_OK

# Incorrect
from starlette.status import HTTP_200_OK
```

---

## Presentation Layer Schemas

### ExampleModelMixin

All request and response schemas (presentation layer) must inherit from `dpe_common.models.base.ExampleModelMixin` to ensure proper Swagger UI metadata:

```python
from dpe_common.models.base import ExampleModelMixin

class CreateInstanceRequest(ExampleModelMixin):
    """Request schema for creating a Cloud SQL instance."""

    name: Annotated[str, Field(description="Instance name", min_length=1, max_length=63, examples=["my-instance"])]
    tier: Annotated[str, Field(description="Machine tier", examples=["db-f1-micro"])]
    region: Annotated[str, Field(description="GCP region", examples=["us-central1"])]
    enabled: Annotated[bool, Field(description="Whether the instance is enabled")]
```

### Rules for `examples`

- All non-default attributes must have at least one value in their `examples` list.
- Boolean and enum attributes do **not** require `examples` — `ExampleModelMixin` injects them automatically.
- Nested model attributes do **not** require `examples` at the parent level — ensure the nested class itself has `examples` on its own attributes so composition works automatically.
- `description` is mandatory for all fields and FastAPI parameters.

---

## Base Class Inheritance for Shared Attributes

Classes (models, schemas, DTOs, entities) with **three or more common attributes** should be refactored into a base class to avoid duplication:

```python
class InstanceBase(ExampleModelMixin):
    """Base attributes shared across instance schemas."""

    name: Annotated[str, Field(description="Instance name", examples=["my-instance"])]
    project_id: Annotated[str, Field(description="GCP project ID", examples=["my-project"])]
    region: Annotated[str, Field(description="GCP region", examples=["us-central1"])]


class CreateInstanceRequest(InstanceBase):
    """Request schema for creating a Cloud SQL instance."""

    tier: Annotated[str, Field(description="Machine tier", examples=["db-f1-micro"])]


class InstanceResponse(InstanceBase):
    """Response schema for a Cloud SQL instance."""

    instance_id: Annotated[str, Field(description="Unique instance identifier", examples=["abc-123"])]
    status: Annotated[InstanceStatus, Field(description="Current instance status")]
```

---

## Exception Handling

### Custom Exception Hierarchy

Define domain-specific exceptions in `domain/exceptions/`. All custom exceptions inherit from a base exception:

```python
# domain/exceptions/base.py
class DomainError(Exception):
    """Base exception for all domain errors."""

    def __init__(self, message: str, code: str | None = None) -> None:
        self.message = message
        self.code = code
        super().__init__(message)


# domain/exceptions/repository_errors.py
class RepositoryError(DomainError):
    """Base exception for repository operations."""


class EntityNotFoundError(RepositoryError):
    """Raised when an entity is not found in the repository."""


class DuplicateEntityError(RepositoryError):
    """Raised when attempting to create a duplicate entity."""


# domain/exceptions/provider_errors.py
class ProviderError(DomainError):
    """Base exception for external provider operations."""


class ProviderTimeoutError(ProviderError):
    """Raised when a provider request times out."""


class ProviderAuthenticationError(ProviderError):
    """Raised when provider authentication fails."""
```

### Exception Flow Across Layers

```text
Infrastructure → Application (Use Case) → Presentation (Router)
     │                    │                        │
     │                    │                        │
  Catch 3rd-party     Handle domain           Map to HTTP
  exceptions,         exceptions,             responses
  raise custom        return UseCaseOutput
  domain exceptions
```

**Infrastructure layer** — Catch third-party library exceptions, raise custom domain exceptions:

```python
# infrastructure/repositories/user_repository.py
from pymongo.errors import DuplicateKeyError, PyMongoError

class MongoUserRepository(IUserRepository):
    async def create(self, user: User) -> User:
        try:
            result = await self._collection.insert_one(user.model_dump())
            return user
        except DuplicateKeyError as e:
            logger.exception("Duplicate user", stack_info=True)
            raise DuplicateEntityError(f"User {user.email} already exists") from e
        except PyMongoError as e:
            logger.exception("MongoDB error during user creation", stack_info=True)
            raise RepositoryError(f"Failed to create user: {e}") from e
```

**Application layer (interfaces)** — Document expected exceptions in docstrings:

```python
# application/interfaces/repositories/i_user_repository.py
class IUserRepository(ABC):
    @abstractmethod
    async def create(self, user: User) -> User:
        """Create a new user in the repository.

        Args:
            user: The user entity to create.

        Returns:
            The created user with assigned ID.

        Raises:
            DuplicateEntityError: When user with same email exists.
            RepositoryError: When database operation fails.
        """
```

**Application layer (use cases)** — Handle domain exceptions, return `UseCaseOutput`:

```python
# application/use_cases/create_user_use_case.py
class CreateUserUseCase(UseCase):
    async def execute(self, request: CreateUserRequest) -> UseCaseOutput:
        try:
            user = User(email=request.email, name=request.name)
            created_user = await self._repository.create(user)
            return UseCaseOutput(
                message="User created successfully",
                status_code=201,
                json_data=created_user.model_dump(),
            )
        except DuplicateEntityError as e:
            logger.error(
                f"Duplicate user: {e.message}",
                exc_info=True,
                stack_info=True,
            )
            return UseCaseOutput(
                message=e.message,
                status_code=409,
                json_data={"error": "duplicate_entity", "code": e.code},
            )
        except RepositoryError as e:
            logger.error(
                f"Repository error: {e.message}",
                exc_info=True,
                stack_info=True,
            )
            return UseCaseOutput(
                message="Failed to create user",
                status_code=500,
                json_data={"error": "repository_error"},
            )
        except Exception as e:
            logger.error(
                f"Unexpected error in CreateUserUseCase: {e}",
                exc_info=True,
                stack_info=True,
            )
            return UseCaseOutput(
                message="Internal server error",
                status_code=500,
                json_data={"error": "internal_error"},
            )
```

### Logging Rules for Exceptions

| Scenario                                  | Logger Method        | Parameters                                                   |
|-------------------------------------------|----------------------|--------------------------------------------------------------|
| Exception caught, will be re-raised       | `logger.exception()` | `stack_info=True` (exc_info is True by default)              |
| Exception caught, returning UseCaseOutput | `logger.error()`     | `exc_info=True, stack_info=True`                             |
| Warning condition (recoverable)           | `logger.warning()`   | `exc_info=True, stack_info=True` if exception context exists |

---

## Configuration with Pydantic BaseSettings

Use Pydantic v2 `BaseSettings` for environment-based configuration with validation:

```python
# domain/config/settings.py
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    """Database connection configuration."""

    model_config = SettingsConfigDict(
        env_prefix="DB_",
        env_file=".env",
        env_file_encoding="utf-8",
    )

    host: str = Field(description="Database host")
    port: int = Field(default=27017, description="Database port")
    username: str = Field(description="Database username")
    password: SecretStr = Field(description="Database password")
    database: str = Field(description="Database name")

    @property
    def connection_string(self) -> str:
        """Build the connection string."""
        return f"mongodb://{self.username}:{self.password.get_secret_value()}@{self.host}:{self.port}/{self.database}"


class AppSettings(BaseSettings):
    """Application-wide settings."""

    model_config = SettingsConfigDict(
        env_prefix="APP_",
        env_file=".env",
        env_file_encoding="utf-8",
    )

    debug: bool = Field(default=False, description="Enable debug mode")
    log_level: str = Field(default="INFO", description="Logging level")
    environment: str = Field(default="development", description="Deployment environment")


# Usage in DI
def get_database_settings() -> DatabaseSettings:
    """Provide database settings from environment."""
    return DatabaseSettings()
```

**Rules:**

- Use `SecretStr` for passwords, tokens, and API keys — prevents accidental logging
- Set `env_prefix` to namespace environment variables (e.g., `DB_HOST`, `APP_DEBUG`)
- Define defaults only for non-sensitive, non-critical settings
- Never hardcode secrets — always load from environment or secret manager

---

## dpe_common Library Usage

Before writing new utilities, check if `dpe_common` already provides them:

| Need                           | Import from dpe_common                                                    |
|--------------------------------|---------------------------------------------------------------------------|
| Use case base class            | `from dpe_common.models.clean_architecture import UseCase, UseCaseOutput` |
| Example model mixin            | `from dpe_common.models.base import ExampleModelMixin`                    |
| Logging decorator              | `from dpe_common import with_logging`                                     |
| Singleton pattern              | `from dpe_common.meta_patterns import Singleton`                          |
| Multiton pattern               | `from dpe_common.meta_patterns import Multiton`                           |
| Config loading                 | `from dpe_common.config_loader import ConfigLoader`                       |
| Logging setup (JSON formatter) | `from dpe_common.logging_setup import setup_logging`                      |
| AWS service managers           | `from dpe_common.service_managers.aws import ...`                         |
| GCP service managers           | `from dpe_common.service_managers.gcp import ...`                         |
| Azure service managers         | `from dpe_common.service_managers.azure import ...`                       |
| MongoDB connectivity           | `from dpe_common.service_managers.mongodb import ...`                     |
| ServiceNow client              | `from dpe_common.snow import ...`                                         |
| Email/Slack utilities          | `from dpe_common.service_managers.email/slack import ...`                 |
| Git utilities                  | `from dpe_common.service_managers.git import ...`                         |
| Common exceptions              | `from dpe_common.exceptions import ...`                                   |
| Common enums                   | `from dpe_common.enums import ...`                                        |

**If what you need doesn't exist in dpe_common**, evaluate:

- **Generic utility** → Propose adding to `dpe_common` (two-PR workflow: dpe_common PR + version bump + Nexus publish, then consumer PR)
- **Project-specific** → Implement locally in the correct layer

---

## New Project Scaffold

When creating a new API project, clone from `DBE/dpe_api_template` which has the correct structure pre-configured:

```bash
# Clone the template
git clone git@github.disney.com:DBE/dpe_api_template.git my-new-api
cd my-new-api

# Remove template git history and reinitialize
rm -rf .git
git init

# Update project name in pyproject.toml, rename folders, etc.
# Install dependencies
poetry install

# Run pre-commit setup
pre-commit install

# Verify everything works
poetry run pytest
pre-commit run --all-files
```
