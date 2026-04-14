# Skill: DynamoDB & S3 safety

Checklist:
- Avoid empty sets in DynamoDB (validation constraints)
- Ensure table/index names are correct per env
- Handle ResourceNotFoundException meaningfully
- For S3: avoid accidental deletes; use safe folder moves and idempotency
