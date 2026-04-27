<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-27 -->
# DPE Calculator Service — Patterns

## Calculator Bean Pattern
- Each product type has a dedicated calculator bean (Spring component)
- Beans are loaded from DB config and cached (TTL: 60s)
- Calculator selection: `productCode` → `calculatorCode` → bean lookup

## Price Freeze Pattern
- After calculation, prices are frozen for 30 minutes (configurable)
- Price tokens stored in DynamoDB with TTL
- Guarantees price stability between quote and purchase

## Caching Strategy
- Redis for calculation results
- Calculator bean cache (in-memory, 60s TTL)
- Cache eviction triggered by Impact Analysis or manual `/actuator/cache/*`

## Error Handling
- Calculator not found → 400 with `CALCULATOR_NOT_FOUND`
- Product not found → empty prices array (not an error)
- Timeout → 504 after 60s query timeout
