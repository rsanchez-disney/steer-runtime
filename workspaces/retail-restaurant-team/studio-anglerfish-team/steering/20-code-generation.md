# Code Generation Rules — wdpr-dine-opp & wdpr-dine-checkin

## MANDATORY: Use schema generator for Codable models

When working in wdpr-dine-opp or wdpr-dine-checkin, **NEVER write Codable structs manually** for service request/response models. Always use the schema-based code generator.

### How it works

| Step | wdpr-dine-opp | wdpr-dine-checkin |
|------|--------------|-------------------|
| Schema location | `mobile-order-service-call-schemas/schemas/` | `dine-checkin-service-call-schemas/schemas/` |
| Namespace file | `WDPRDineOPP/Core/Services/Services.swift` | `WDPRDineCheckin/Core/Services/Services.swift` |
| Generate command | `./mobile-order-service-call-schemas/scripts/generate-classes.swift ios swift ./mobile-order-service-call-schemas ./WDPRDineOPP/Core/Services/Generated` | `./dine-checkin-service-call-schemas/scripts/generate-classes.swift ios swift ./dine-checkin-service-call-schemas ./WDPRDineCheckin/Core/Services/Generated` |
| Output | `WDPRDineOPP/Core/Services/Generated/` | `WDPRDineCheckin/Core/Services/Generated/` |

### Steps

1. Define the model as a JSON schema in the repo's schema directory
2. If adding a new service domain, add the namespace enum to the repo's `Services.swift`
3. Run the generate command (see table above)
4. Add any new generated files to the `.xcodeproj`

### Schema JSON format

File name: `Services.<Domain>.<SubDomain>.json`

```json
{
    "version": "3.0",
    "dataTypes": [
        {
            "fullyQualifiedName": "Services.<Domain>.<TypeName>",
            "properties": [
                { "name": "id", "fullyQualifiedDataType": "String", "description": "Unique identifier" },
                { "name": "items", "fullyQualifiedDataType": "[Services.Domain.Item]", "description": "List of items" },
                { "name": "optional", "fullyQualifiedDataType": "String?", "description": "Optional field" }
            ]
        }
    ]
}
```

### When to use

- Adding a new Worker response model → use generator
- Adding a new Worker request model → use generator
- Modifying an existing service model → edit the existing JSON schema, re-run generator

### When NOT to use

- Domain models that aren't directly tied to a service call (e.g., view models, UI state)
- Models in Scan-and-Go or fnb-shared (they don't use this generator)
