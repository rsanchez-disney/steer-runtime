---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.js", "**/*.spec.ts", "**/*.test.*", "package.json", "tsconfig*.json"]
---

# WebAPI (Node) steering — wdpr-payment-controls-api

## Role
- Gateway/BFF layer: validate, orchestrate, map responses, stream exports.

## Export behavior
- Prefer streaming responses for large exports.
- Avoid loading entire payloads in memory.
- If pagination/batching exists, expose progress events when possible.

## Contracts
- Do not break downstream UI expectations.
- Prefer additive fields and versioned endpoints when required.
