# Performance Optimization Standards

## Database
- Avoid N+1 queries — use batch fetching, eager loading, or joins
- Use database indexes for frequently queried columns
- Use connection pooling — never open/close connections per request
- Cache expensive queries with appropriate TTL
- Use pagination for large result sets

## API
- Set appropriate timeouts for all external calls
- Use circuit breakers for unreliable dependencies
- Implement retry with exponential backoff
- Use async/non-blocking I/O where available
- Compress responses (gzip/brotli)

## Memory
- Avoid loading entire datasets into memory — use streaming/pagination
- Release resources promptly (close connections, streams, files)
- Watch for memory leaks in long-running processes
- Use object pooling for expensive-to-create objects

## Caching
- Cache at the right layer: CDN → reverse proxy → application → database
- Use cache-aside pattern for read-heavy data
- Set TTLs appropriate to data freshness requirements
- Invalidate caches on writes — don't serve stale data for critical operations

## Frontend
- Lazy load components and routes
- Optimize bundle size — tree-shake unused code
- Use virtual scrolling for large lists
- Debounce user input that triggers API calls

## Monitoring
- Track P50, P95, P99 response times — not just averages
- Set alerts for latency regressions
- Profile before optimizing — measure, don't guess
- Load test critical paths before release
