# Lambda Patterns (Node.js / TypeScript)

## Thin Handler Pattern

Every Lambda handler is a thin entry point that delegates to service modules. The handler extracts input from the event, calls a service function with typed parameters, and returns a structured response. Business logic never lives in the handler file.

### Handler Structure

```typescript
// src/handlers/get-config.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getConfiguration } from '../services/configuration.service';
import { logger } from '../lib/logger';
import { toErrorResponse } from '../lib/errors';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const correlationId = event.headers['x-correlation-id'] ?? crypto.randomUUID();
  logger.setCorrelationId(correlationId);

  try {
    const configId = event.pathParameters?.configId;
    if (!configId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing configId', code: 'MISSING_PARAM' }),
      };
    }

    const result = await getConfiguration(configId);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    logger.error('Handler failed', { error: err });
    return toErrorResponse(err);
  }
};
```

### Service Module

```typescript
// src/services/configuration.service.ts
import { ConfigRepository } from '../repositories/config.repository';
import { Configuration } from '../types/configuration';

const repo = new ConfigRepository();

export async function getConfiguration(configId: string): Promise<Configuration> {
  const config = await repo.findById(configId);
  if (!config) {
    throw new AppError(`Configuration ${configId} not found`, 404, 'NOT_FOUND');
  }
  return config;
}

export async function compareConfigurations(
  sourceId: string,
  targetId: string,
): Promise<ConfigDiff> {
  const [source, target] = await Promise.all([
    repo.findById(sourceId),
    repo.findById(targetId),
  ]);
  return computeDiff(source, target);
}
```

### Project Layout

```
src/
├── handlers/           # Thin Lambda entry points (one per function)
│   ├── get-config.ts
│   ├── compare-configs.ts
│   └── export-report.ts
├── services/           # Business logic modules
│   ├── configuration.service.ts
│   ├── comparison.service.ts
│   └── export.service.ts
├── repositories/       # Data access (DynamoDB, S3)
│   └── config.repository.ts
├── lib/                # Shared utilities
│   ├── logger.ts
│   ├── errors.ts
│   └── validation.ts
├── types/              # Shared TypeScript interfaces
│   └── configuration.ts
└── __tests__/          # Unit tests mirroring src/ structure
    ├── handlers/
    └── services/
template.yaml           # SAM template
events/                 # Test event payloads
```

Rules:
- One handler file per Lambda function in `src/handlers/`.
- Handlers do three things: extract input, call service, return response.
- Business logic lives in `src/services/` — pure functions or classes with injected dependencies.
- Data access lives in `src/repositories/` — isolated from business logic.
- Shared utilities (logger, errors, validation) live in `src/lib/`.
- TypeScript interfaces live in `src/types/`.


## Cold Start Optimization

Cold starts occur when AWS provisions a new execution environment. Minimize cold start latency with these techniques.

### Minimize Package Size

Use `esbuild` to tree-shake and bundle into a single file. Never ship raw `node_modules` to Lambda.

```typescript
// esbuild.config.ts
import { build } from 'esbuild';

await build({
  entryPoints: ['src/handlers/get-config.ts', 'src/handlers/export-report.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist/handlers',
  external: ['@aws-sdk/*'],  // AWS SDK v3 is included in Lambda runtime
  sourcemap: true,
});
```

```yaml
# SAM template — point to bundled output
Resources:
  GetConfigFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/handlers/get-config.handler
      Runtime: nodejs20.x
      CodeUri: .
```

Rules:
- Use `esbuild` (or equivalent bundler) for tree-shaking and single-file output.
- Mark `@aws-sdk/*` as external — the Lambda runtime includes AWS SDK v3.
- Enable `sourcemap: true` for debugging in CloudWatch.
- Target `node20` (or the runtime version in your SAM template).

### Lazy-Load Heavy Dependencies

Import expensive modules inside the function body when they are not needed on every invocation.

```typescript
// ❌ WRONG — top-level import loads on every cold start even if not used
import { PDFDocument } from 'pdf-lib';

export const handler = async (event: APIGatewayProxyEvent) => {
  // ...
};

// ✅ CORRECT — lazy-load only when the code path needs it
let pdfLib: typeof import('pdf-lib') | undefined;

async function getPdfLib() {
  if (!pdfLib) {
    pdfLib = await import('pdf-lib');
  }
  return pdfLib;
}

export const handler = async (event: APIGatewayProxyEvent) => {
  // Only loads pdf-lib when this handler actually generates a PDF
  const { PDFDocument } = await getPdfLib();
  const doc = await PDFDocument.create();
  // ...
};
```

### Connection Reuse

Initialize SDK clients and database connections at module scope so they persist across warm invocations.

```typescript
// src/lib/dynamodb.ts — module-scope initialization
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});
```

```typescript
// src/lib/s3.ts — module-scope initialization
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({});
```

```typescript
// src/repositories/config.repository.ts — uses shared client
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../lib/dynamodb';

const TABLE_NAME = process.env.CONFIG_TABLE_NAME!;

export class ConfigRepository {
  async findById(configId: string): Promise<Configuration | null> {
    const result = await docClient.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { id: configId } }),
    );
    return (result.Item as Configuration) ?? null;
  }

  async save(config: Configuration): Promise<void> {
    await docClient.send(
      new PutCommand({ TableName: TABLE_NAME, Item: config }),
    );
  }
}
```

Rules:
- Initialize SDK clients at module scope (outside the handler function).
- Module-scope variables persist across warm invocations within the same execution environment.
- Use `DynamoDBDocumentClient.from()` for simplified marshalling.
- Reference table/bucket names via environment variables — never hardcode.
- Use `@aws-sdk/*` v3 modular clients, not the monolithic `aws-sdk` v2.


## Structured Logging

All log output must be structured JSON for CloudWatch Logs Insights queries. Never use bare `console.log()`.

### Logger Implementation

```typescript
// src/lib/logger.ts
interface LogEntry {
  level: string;
  message: string;
  correlationId?: string;
  functionName?: string;
  requestId?: string;
  timestamp: string;
  [key: string]: unknown;
}

class Logger {
  private correlationId?: string;
  private requestId?: string;

  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  setRequestId(id: string): void {
    this.requestId = id;
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('WARN', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('ERROR', message, data);
  }

  private log(level: string, message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      correlationId: this.correlationId,
      requestId: this.requestId,
      functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      ...data,
    };
    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}

export const logger = new Logger();
```

### Usage in Handlers

```typescript
// src/handlers/export-report.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { exportReport } from '../services/export.service';
import { logger } from '../lib/logger';
import { toErrorResponse } from '../lib/errors';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const correlationId = event.headers['x-correlation-id'] ?? crypto.randomUUID();
  logger.setCorrelationId(correlationId);
  logger.setRequestId(context.awsRequestId);

  logger.info('Export report requested', {
    clientId: event.pathParameters?.clientId,
    reportType: event.queryStringParameters?.type,
  });

  try {
    const result = await exportReport({
      clientId: event.pathParameters?.clientId!,
      reportType: event.queryStringParameters?.type ?? 'full',
    });

    logger.info('Export report completed', { reportId: result.reportId });
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    logger.error('Export report failed', { error: err });
    return toErrorResponse(err);
  }
};
```

### CloudWatch Logs Insights Queries

Structured JSON logs enable powerful queries in CloudWatch Logs Insights:

```
# Find all errors for a specific correlation ID
fields @timestamp, level, message, correlationId
| filter correlationId = "abc-123-def"
| sort @timestamp asc

# Count errors by function in the last hour
fields functionName, message
| filter level = "ERROR"
| stats count(*) as errorCount by functionName
| sort errorCount desc

# Trace a request across multiple Lambda functions
fields @timestamp, functionName, message, correlationId
| filter correlationId = "abc-123-def"
| sort @timestamp asc

# Find slow operations (logged duration > 3000ms)
fields @timestamp, functionName, message, duration
| filter duration > 3000
| sort duration desc
```

Rules:
- Every log entry must include `correlationId`, `level`, `timestamp`, and `functionName`.
- Set `correlationId` from the incoming `x-correlation-id` header; generate a UUID if absent.
- Set `requestId` from `context.awsRequestId` for Lambda-level tracing.
- Use `process.stdout.write(JSON.stringify(entry) + '\n')` — not `console.log()`.
- Never log sensitive data: PII, tokens, credentials, full request bodies with user data.
- Log at handler entry and exit for request tracing.
- Include relevant business identifiers (clientId, configId, reportType) for debugging.


## Local Testing

### AWS SAM CLI

Use AWS SAM CLI to test Lambda functions locally before deploying. SAM simulates the Lambda runtime and API Gateway locally.

#### Test Event Files

Store test events as JSON files in the `events/` directory:

```json
// events/get-config.json
{
  "httpMethod": "GET",
  "path": "/configs/config-123",
  "pathParameters": {
    "configId": "config-123"
  },
  "headers": {
    "x-correlation-id": "test-corr-001",
    "Content-Type": "application/json"
  },
  "queryStringParameters": null,
  "body": null
}
```

```json
// events/compare-configs.json
{
  "httpMethod": "POST",
  "path": "/configs/compare",
  "pathParameters": null,
  "headers": {
    "x-correlation-id": "test-corr-002",
    "Content-Type": "application/json"
  },
  "queryStringParameters": null,
  "body": "{\"sourceId\":\"config-123\",\"targetId\":\"config-456\"}"
}
```

```json
// events/export-report.json
{
  "httpMethod": "GET",
  "path": "/clients/client-001/reports",
  "pathParameters": {
    "clientId": "client-001"
  },
  "headers": {
    "x-correlation-id": "test-corr-003"
  },
  "queryStringParameters": {
    "type": "finance"
  },
  "body": null
}
```

#### SAM CLI Commands

```bash
# Validate the SAM template
sam validate --lint

# Invoke a single function with a test event
sam local invoke GetConfigFunction --event events/get-config.json

# Invoke with environment variable overrides
sam local invoke GetConfigFunction \
  --event events/get-config.json \
  --env-vars env.local.json

# Start a local API Gateway (all functions)
sam local start-api --port 3001

# Build before invoking (compiles TypeScript via esbuild)
sam build && sam local invoke GetConfigFunction --event events/get-config.json

# Generate a sample event for API Gateway
sam local generate-event apigateway aws-proxy \
  --method GET \
  --path /configs/config-123 > events/generated.json
```

#### Local Environment Variables

```json
// env.local.json — local overrides for sam local invoke
{
  "GetConfigFunction": {
    "CONFIG_TABLE_NAME": "local-config-table",
    "LOG_LEVEL": "DEBUG",
    "AWS_REGION": "us-east-1"
  },
  "ExportReportFunction": {
    "REPORT_BUCKET_NAME": "local-reports-bucket",
    "CONFIG_TABLE_NAME": "local-config-table"
  }
}
```

### Unit Testing

Test service modules independently — they contain the business logic. Test handlers with typed event fixtures.

```typescript
// src/__tests__/services/configuration.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getConfiguration } from '../../services/configuration.service';
import { ConfigRepository } from '../../repositories/config.repository';

vi.mock('../../repositories/config.repository');

describe('getConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns configuration for a valid ID', async () => {
    const mockConfig = { id: 'config-123', name: 'Test Config', version: 1 };
    vi.mocked(ConfigRepository.prototype.findById).mockResolvedValue(mockConfig);

    const result = await getConfiguration('config-123');

    expect(result).toEqual(mockConfig);
    expect(ConfigRepository.prototype.findById).toHaveBeenCalledWith('config-123');
  });

  it('throws AppError when configuration not found', async () => {
    vi.mocked(ConfigRepository.prototype.findById).mockResolvedValue(null);

    await expect(getConfiguration('missing-id')).rejects.toThrow('not found');
  });
});
```

```typescript
// src/__tests__/handlers/get-config.test.ts
import { describe, it, expect, vi } from 'vitest';
import { handler } from '../../handlers/get-config';
import type { APIGatewayProxyEvent } from 'aws-lambda';

function createEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    httpMethod: 'GET',
    path: '/configs/config-123',
    pathParameters: { configId: 'config-123' },
    headers: { 'x-correlation-id': 'test-001' },
    queryStringParameters: null,
    body: null,
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    ...overrides,
  } as APIGatewayProxyEvent;
}

describe('get-config handler', () => {
  it('returns 400 when configId is missing', async () => {
    const event = createEvent({ pathParameters: null });
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('error');
  });

  it('returns 200 with configuration data', async () => {
    const event = createEvent({ pathParameters: { configId: 'config-123' } });
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
  });
});
```

Rules:
- Store test events in `events/` as JSON files matching API Gateway proxy event format.
- Use `env.local.json` for local environment variable overrides — never commit real credentials.
- Use `sam validate --lint` to catch template errors before invoking.
- Test service modules with `vitest` or `jest` — mock repository dependencies, not AWS SDK calls.
- Create a typed `createEvent()` helper for handler tests to reduce boilerplate.
- Use `sam local start-api` for integration testing with a local API Gateway.


## Error Handling

### Structured Error Responses

Return consistent error shapes from all handlers. Include a human-readable `error` message and a machine-readable `code` for programmatic handling. Never leak stack traces or internal details in API responses.

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'INTERNAL_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} '${id}' not found`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export function toErrorResponse(err: unknown): { statusCode: number; body: string } {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: JSON.stringify({ error: err.message, code: err.code }),
    };
  }
  // Unknown errors — return generic 500, log the real error separately
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
  };
}
```

### Usage in Handlers

```typescript
// src/handlers/compare-configs.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { compareConfigurations } from '../services/comparison.service';
import { ValidationError } from '../lib/errors';
import { logger } from '../lib/logger';
import { toErrorResponse } from '../lib/errors';

interface CompareRequest {
  sourceId: string;
  targetId: string;
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const correlationId = event.headers['x-correlation-id'] ?? crypto.randomUUID();
  logger.setCorrelationId(correlationId);

  try {
    if (!event.body) {
      throw new ValidationError('Request body is required');
    }

    const { sourceId, targetId } = JSON.parse(event.body) as CompareRequest;
    if (!sourceId || !targetId) {
      throw new ValidationError('sourceId and targetId are required');
    }

    const diff = await compareConfigurations(sourceId, targetId);
    return { statusCode: 200, body: JSON.stringify(diff) };
  } catch (err) {
    logger.error('Compare configs failed', { error: err });
    return toErrorResponse(err);
  }
};
```

### Retry Semantics

| Invocation Type | Source | Retry Behavior | Handler Requirement |
|-----------------|--------|----------------|---------------------|
| Synchronous | API Gateway, SDK `Invoke` | No automatic retry — error returned to caller | Return structured error response |
| Asynchronous | SQS, EventBridge, S3 | AWS retries up to 2 times by default | Handler must be **idempotent** |
| Stream-based | DynamoDB Streams, Kinesis | Retries until record expires or succeeds | Handler must be idempotent; use `bisectBatchOnFunctionError` |

For asynchronous invocations, design handlers to be idempotent:

```typescript
// Idempotent write — use a conditional expression to prevent duplicate processing
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../lib/dynamodb';

export async function processEvent(eventId: string, data: EventPayload): Promise<void> {
  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.EVENTS_TABLE_NAME!,
        Item: { id: eventId, ...data, processedAt: new Date().toISOString() },
        ConditionExpression: 'attribute_not_exists(id)',  // skip if already processed
      }),
    );
  } catch (err: any) {
    if (err.name === 'ConditionalCheckFailedException') {
      // Already processed — safe to ignore
      logger.info('Duplicate event skipped', { eventId });
      return;
    }
    throw err;
  }
}
```

```yaml
# SAM template — configure retry and DLQ for async functions
Resources:
  ProcessEventFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/handlers/process-event.handler
      Runtime: nodejs20.x
      EventInvokeConfig:
        MaximumRetryAttempts: 1
        DestinationConfig:
          OnFailure:
            Type: SQS
            Destination: !GetAtt DeadLetterQueue.Arn
```

Rules:
- Use `AppError` subclasses for domain-specific errors (NotFoundError, ValidationError).
- Use `toErrorResponse()` in every handler's catch block for consistent error shapes.
- Never expose stack traces, internal paths, or dependency details in API responses.
- For async handlers (SQS, EventBridge), design for idempotency using conditional writes or deduplication keys.
- Configure dead-letter queues (DLQ) for async functions to capture failed events.
- Log the full error internally; return a sanitized message to the caller.


## IAM & Security

### Least-Privilege IAM Roles

Each Lambda function gets its own IAM role scoped to exactly the resources it needs. Use SAM policy templates for common patterns.

```yaml
# template.yaml — complete SAM template with least-privilege policies
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Config Studio pre-sales Lambda functions

Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 10
    MemorySize: 256
    Tracing: Active
    Environment:
      Variables:
        LOG_LEVEL: INFO

Parameters:
  Stage:
    Type: String
    Default: dev
    AllowedValues: [dev, stage, prod]

Resources:
  # --- DynamoDB Table ---
  ConfigTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '${Stage}-config-studio-configs'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      SSESpecification:
        SSEEnabled: true

  # --- S3 Bucket for Reports ---
  ReportBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${Stage}-config-studio-reports'
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  # --- Lambda Functions ---
  GetConfigFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/handlers/get-config.handler
      Description: Retrieve a single configuration by ID
      Environment:
        Variables:
          CONFIG_TABLE_NAME: !Ref ConfigTable
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref ConfigTable
      Events:
        GetConfig:
          Type: Api
          Properties:
            Path: /configs/{configId}
            Method: GET

  CompareConfigsFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/handlers/compare-configs.handler
      Description: Compare two configurations and return diff
      Environment:
        Variables:
          CONFIG_TABLE_NAME: !Ref ConfigTable
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref ConfigTable
      Events:
        CompareConfigs:
          Type: Api
          Properties:
            Path: /configs/compare
            Method: POST

  ExportReportFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/handlers/export-report.handler
      Description: Generate and store a client report in S3
      Timeout: 30
      MemorySize: 512
      Environment:
        Variables:
          CONFIG_TABLE_NAME: !Ref ConfigTable
          REPORT_BUCKET_NAME: !Ref ReportBucket
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref ConfigTable
        - S3CrudPolicy:
            BucketName: !Ref ReportBucket
      Events:
        ExportReport:
          Type: Api
          Properties:
            Path: /clients/{clientId}/reports
            Method: GET

Outputs:
  ApiUrl:
    Description: API Gateway endpoint URL
    Value: !Sub 'https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/'
```

### SAM Policy Templates

Use SAM's built-in policy templates instead of writing raw IAM policies:

| Template | Grants | Use When |
|----------|--------|----------|
| `DynamoDBReadPolicy` | `GetItem`, `Query`, `Scan`, `BatchGetItem` | Read-only access to a table |
| `DynamoDBCrudPolicy` | All DynamoDB actions on a table | Full CRUD access |
| `S3ReadPolicy` | `GetObject`, `ListBucket` | Reading objects from S3 |
| `S3CrudPolicy` | `GetObject`, `PutObject`, `DeleteObject`, `ListBucket` | Full S3 object access |
| `SQSSendMessagePolicy` | `SendMessage` | Sending messages to an SQS queue |
| `SSMParameterReadPolicy` | `GetParameter`, `GetParameters` | Reading SSM parameters |
| `SecretsManagerGetSecretValuePolicy` | `GetSecretValue` | Reading secrets |

### Environment-Based Configuration

Use environment variables for all stage-specific values. Never hardcode ARNs, account IDs, or endpoints.

```typescript
// src/lib/config.ts — typed environment configuration
interface AppConfig {
  configTableName: string;
  reportBucketName: string;
  logLevel: string;
  stage: string;
}

function loadConfig(): AppConfig {
  const configTableName = process.env.CONFIG_TABLE_NAME;
  if (!configTableName) {
    throw new Error('CONFIG_TABLE_NAME environment variable is required');
  }

  return {
    configTableName,
    reportBucketName: process.env.REPORT_BUCKET_NAME ?? '',
    logLevel: process.env.LOG_LEVEL ?? 'INFO',
    stage: process.env.STAGE ?? 'dev',
  };
}

export const config = loadConfig();
```

### Secrets Management

```typescript
// src/lib/secrets.ts — retrieve secrets from SSM Parameter Store
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({});
const secretCache = new Map<string, string>();

export async function getSecret(parameterName: string): Promise<string> {
  const cached = secretCache.get(parameterName);
  if (cached) return cached;

  const result = await ssm.send(
    new GetParameterCommand({ Name: parameterName, WithDecryption: true }),
  );

  const value = result.Parameter?.Value;
  if (!value) {
    throw new Error(`SSM parameter '${parameterName}' not found or empty`);
  }

  secretCache.set(parameterName, value);
  return value;
}
```

### Input Validation

Validate all incoming event data before passing to service modules:

```typescript
// src/lib/validation.ts
import { z } from 'zod';
import { ValidationError } from './errors';

export const CompareRequestSchema = z.object({
  sourceId: z.string().min(1, 'sourceId is required'),
  targetId: z.string().min(1, 'targetId is required'),
});

export const ExportRequestSchema = z.object({
  clientId: z.string().min(1, 'clientId is required'),
  reportType: z.enum(['full', 'finance', 'custom']).default('full'),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.errors.map((e) => e.message).join('; ');
    throw new ValidationError(messages);
  }
  return result.data;
}
```

```typescript
// Usage in handler
import { validate, CompareRequestSchema } from '../lib/validation';

export const handler = async (event: APIGatewayProxyEvent) => {
  // ...
  const body = validate(CompareRequestSchema, JSON.parse(event.body ?? '{}'));
  const diff = await compareConfigurations(body.sourceId, body.targetId);
  // ...
};
```

Rules:
- One IAM role per Lambda function — never share roles across functions.
- Use SAM policy templates (`DynamoDBReadPolicy`, `S3CrudPolicy`, etc.) instead of raw IAM.
- Never use `Resource: "*"` in production IAM policies.
- Store stage-specific values (table names, bucket names, API URLs) in environment variables.
- Store secrets (API keys, database passwords) in SSM Parameter Store or Secrets Manager — never in environment variables or source code.
- Cache secrets in memory to avoid repeated SSM calls on warm invocations.
- Validate all incoming event data with Zod (or Joi/class-validator) before processing.
- Enable encryption at rest for DynamoDB tables and S3 buckets.
- Block public access on all S3 buckets.
- Enable X-Ray tracing (`Tracing: Active`) for distributed tracing across Lambda functions.
