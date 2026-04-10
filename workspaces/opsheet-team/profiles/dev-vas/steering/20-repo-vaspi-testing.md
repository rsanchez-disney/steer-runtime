---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.js", "**/*.spec.ts", "**/*.test.*", "package.json", "tsconfig*.json", "jest.config*"]
description: Testing conventions, stack, and patterns using Jest
---

# Testing Conventions

## Stack

- Jest with ts-jest preset
- Test timeout: 10s (unit), 15s (integration)
- Coverage thresholds enforced and auto-bumped on pre-push

## Structure

- Tests live in `src/tests/domains/{domain}/` mirroring the source structure
- One test file per source file: `{domain}.{type}.spec.ts`
- Helpers in `src/tests/helpers/`
- Integration tests in `src/tests/integration/` (separate jest config)

## Mocking Pattern

The project uses a custom `Mock` utility (`src/tests/helpers/generic-mock.ts`) instead of `jest.mock()` for service dependencies.

```typescript
import { DomainController } from '../../../controllers/domain.controller';
import { DomainService } from '../../../services';
import { Mock, MockControl } from '../../helpers/generic-mock';
import { Context } from '../../../models';

let domainSvc: DomainService & MockControl<DomainService>;
let controller: DomainController;

describe('DomainController', () => {
  beforeAll(() => {
    domainSvc = Mock.create<DomainService>('domainSvc');
    controller = new DomainController({ domainSvc });
  });

  afterEach(() => {
    domainSvc.clear();
  });

  it('should return resource', async () => {
    const ctx = {
      context: {
        params: { id: 'test-id' },
        updateUsername: 'testUser',
      },
      get: () => undefined,
    } as unknown as Context;

    domainSvc.setMethodReturnValue('getResource', 'test-id', 'testUser', { id: 'test-id', name: 'Test' });

    const result = await controller.getResource(ctx);
    expect(result).toEqual({ id: 'test-id', name: 'Test' });
  });

  it('should throw when service fails', async () => {
    const ctx = {
      context: { params: { id: 'test-id' }, updateUsername: 'testUser' },
      get: () => undefined,
    } as unknown as Context;

    domainSvc.setMethodToThrow('getResource', 'test-id', 'testUser', Mock.EXPECTED_ERROR);

    await expect(controller.getResource(ctx)).rejects.toThrow(Mock.EXPECTED_ERROR);
  });
});
```

### Key Mock API

- `Mock.create<T>(name)` — creates a proxy mock implementing interface T
- `mock.setMethodReturnValue(methodName, ...args, returnValue)` — stub a return value
- `mock.setMethodToThrow(methodName, ...args, error)` — stub an error
- `mock.getCallHistoryByMethod(methodName)` — inspect call history
- `mock.clear()` — reset all stubs and history
- `Mock.EXPECTED_ERROR` — standard error for failure tests
- `Mock.ANY_VALUE` (`'*'`) — wildcard for argument matching

### Context Helper

Use `makeEmptyCtx()` from `src/tests/helpers/context.ts` for creating base test contexts.

### Global Setup

`src/tests/setup.ts` mocks `@opsheet/logger` globally to suppress console noise.

## Commands

- `npm run test` — run all unit tests (sequential, 10s timeout)
- `npm run test:parallel` — run all unit tests (parallel)
- `npm run test:integration` — run integration tests (15s timeout)
- Coverage is collected from: controllers, services, middlewares, processors, transformers, utils, decorators
