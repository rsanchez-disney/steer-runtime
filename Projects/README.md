# Projects

Pre-configured memory banks for known projects.

## Available Projects

| Project | Description |
|---------|-------------|
| `wdpr-payment-svc` | Payment Service - REST microservice for payment processing |
| `cart-service-java8` | Cart Service - Shopping cart for Disney e-commerce |
| `wdpr-config-services` | Config Studio - Java backend services |
| `wdpr-payment-controls-api` | Config Studio - Node.js BFF/API layer |
| `wdpr-payment-controls-client` | Config Studio - Angular frontend (shared UI) |
| `wdpr-gcp-admin-api` | GCP - Gift Card Platform API |
| `wdpr-cap-rev-rec-svc` | CAP - Revenue recognition service |
| `spr-router` | SPR - Core routing service (Go) |
| `spr-ai-adapter` | SPR - AI integration layer |

## Usage

```bash
# Auto-detect and copy memory bank for known project
./setup.sh init-memory ~/wdpr-payment-svc

# Use a known project as template for a new project
./setup.sh init-memory ~/my-new-project --from wdpr-payment-svc

# Generate from templates (for unknown projects)
./setup.sh init-memory ~/my-new-project
```

## Adding New Projects

1. Create a directory with the project name (matching the repo folder name)
2. Add `.kiro/rules/memory-bank/` structure:
   ```
   Projects/<project-name>/
   └── .kiro/
       └── rules/
           └── memory-bank/
               ├── guidelines.md
               ├── product.md
               ├── structure.md
               └── tech.md
   ```
3. Populate the memory bank files with project-specific information
4. The project will be auto-discovered by `./setup.sh init-memory`

## Memory Bank Files

| File | Purpose |
|------|---------|
| `guidelines.md` | Coding standards, patterns, idioms, testing conventions |
| `product.md` | Product overview, features, target users, use cases |
| `structure.md` | Directory layout, architecture, component relationships |
| `tech.md` | Tech stack, dependencies, build commands, deployment |
