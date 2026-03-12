---
inclusion: fileMatch
fileMatchPattern: ["**/*.java", "**/*.kt", "**/*.xml", "**/*.yml", "**/*.yaml", "pom.xml", "build.gradle*", "gradle.properties"]
---

# Backend (Java) steering — wdpr-config-services

## Role
- Core domain + persistence: DynamoDB/MariaDB/S3 promotion/workflows.

## Backward compatibility
- Do not modify existing endpoints in a breaking way.
- Prefer adding new endpoints or adding optional fields.

## Performance
- For exports: use batching, avoid N+1 queries, measure hot paths.
- Keep timing metrics logs at DEBUG.

## Testing
- Maintain high coverage for service/helper logic.
- Add unit tests for new branches and error handling.
