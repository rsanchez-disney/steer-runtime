# SQL & Database Standards

## Query Design
- Always use parameterized queries — never concatenate user input
- Use explicit column lists in SELECT — avoid `SELECT *`
- Use JOINs instead of subqueries where performance allows
- Limit result sets with pagination (LIMIT/OFFSET or keyset)
- Avoid N+1 queries — use batch fetching or eager loading

## Schema Design
- Use meaningful table and column names (snake_case)
- Define primary keys on all tables
- Add foreign key constraints for referential integrity
- Use appropriate data types — don't store dates as strings
- Add NOT NULL constraints where applicable
- Include `created_at` and `updated_at` timestamps

## Indexing
- Index columns used in WHERE, JOIN, and ORDER BY clauses
- Use composite indexes for multi-column queries (leftmost prefix rule)
- Don't over-index — each index adds write overhead
- Review slow query logs regularly

## Migrations
- Use versioned migration tools (Flyway, Liquibase, Alembic)
- Migrations must be backward-compatible (additive only)
- Never drop columns in the same release that stops using them
- Test migrations against production-sized datasets

## Performance
- Use EXPLAIN/EXPLAIN ANALYZE to verify query plans
- Avoid full table scans on large tables
- Use connection pooling
- Cache frequently-read, rarely-changed data
