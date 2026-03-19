# Performance Testing Patterns

## k6 Load Test Template

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // ramp up
    { duration: '3m', target: 50 },   // steady
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95th percentile < 500ms
    http_req_failed: ['rate<0.01'],    // <1% errors
  },
};

export default function () {
  const res = http.get('https://api.example.com/endpoint');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

## Performance Budgets

| Metric | Target | Critical |
|--------|--------|----------|
| API p95 latency | <500ms | >1000ms |
| API p99 latency | <1000ms | >2000ms |
| Error rate | <0.1% | >1% |
| Throughput | >100 rps | <50 rps |
| Time to First Byte | <200ms | >500ms |

## Test Types

- **Smoke**: 1-2 VUs, verify system works under minimal load
- **Load**: Expected concurrent users, sustained duration
- **Stress**: Beyond expected load, find breaking point
- **Soak**: Normal load over extended period, detect memory leaks
- **Spike**: Sudden burst of traffic, test auto-scaling

## Common Bottlenecks

- N+1 database queries
- Missing database indexes
- Unbounded result sets (no pagination)
- Synchronous external API calls
- Missing cache layers
- Connection pool exhaustion
- Large payload serialization
