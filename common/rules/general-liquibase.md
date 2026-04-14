# Liquibase Migration Standards

## File Naming

```
YYYYMMDD_XXX_DescriptiveName.yaml
```

- Date: `YYYYMMDD` (e.g., `20260326`)
- Sequence: `XXX` zero-padded (e.g., `001`)
- Name: PascalCase, descriptive (e.g., `CreateOrderTable`)

## ChangeSet Structure

```yaml
databaseChangeLog:
  - changeSet:
      id: 001-create-order-table
      author: your.name
      comment: Create the order table with core fields
      changes:
        - createTable:
            tableName: orders
            columns:
              - column:
                  name: id
                  type: BIGINT
                  autoIncrement: true
                  constraints:
                    primaryKey: true
      rollback:
        - dropTable:
            tableName: orders
```

## Rules

- Every changeSet MUST have a `rollback` section
- Use kebab-case for changeSet IDs: `XXX-descriptive-name`
- One logical change per changeSet — don't mix DDL and DML
- Never modify an existing changeSet that's been applied — create a new one
- Use `preConditions` to make migrations idempotent
- Include `comment` for non-obvious changes
- Use `validCheckSum` only as a last resort

## Master Changelog

```yaml
databaseChangeLog:
  - include:
      file: 20260101_001_CreateUserTable.yaml
      relativeToChangelogFile: true
  - include:
      file: 20260115_002_AddEmailIndex.yaml
      relativeToChangelogFile: true
```

- Include files in chronological order
- Never reorder existing includes

## Testing

- Test migrations against a clean database
- Test rollbacks for every changeSet
- Test against production-sized data for performance-sensitive changes
- Use `liquibase diff` to verify expected vs actual schema
