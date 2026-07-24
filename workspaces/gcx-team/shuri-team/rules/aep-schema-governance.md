# AEP schema governance

Rules for designing and managing XDM schemas in Adobe Experience Platform for the Shuri team.

## Schema naming conventions

- Schema names use **Title Case with spaces**: `Parks Profile Event`, `Gam Transaction Event`, `Park Pass Reservation Profile`
- Field names use **camelCase**: `swid`, `reservationDate`, `loyaltyTier`
- Custom field group names follow the pattern `_wdpro.{SorName}.{GroupPurpose}` — e.g., `_wdpro.gam.TransactionDetails`
- Tenant namespace prefix is `_wdpro` for all custom fields
- Never use generic names like `Data` or `Info` — be specific to the domain

```json
{
  "$id": "https://ns.adobe.com/wdpro/schemas/gam-transaction-event",
  "title": "Gam Transaction Event",
  "type": "object",
  "meta:extends": [
    "https://ns.adobe.com/xdm/context/experienceevent"
  ]
}
```

## Field group organization

- Create a **new field group** when:
  - The fields are specific to a single SOR (GAM, Park Pass, etc.)
  - No existing group covers the semantic meaning of the data
  - Combining unrelated fields would reduce reusability
- Keep field groups focused — one group per logical domain concept
- Never put identity fields and behavioral fields in the same custom group

## Identity namespace standards

- Every profile schema **must** have a primary identity field
- Primary identity for guest profiles: `SWID`
- Secondary identities: `ECID`, `EMAIL`
- Namespace naming convention: **SCREAMING_SNAKE_CASE**
- Mark identity fields with `"meta:xdmType": "string"` and set `"xdm:namespace"` explicitly
- Never use `ECID` as a primary identity for profile schemas — it is device-scoped