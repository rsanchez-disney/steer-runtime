---
name: uc-debug-payload
description: Generates UC debug page request bodies for different scenarios (Room Only, Package, TEP3, non-TEP3, Consumer, Trade). Use when the user asks for a "debug payload", "debug page body", "initialize payload", or mentions entering UC with specific product types.
---

# UC Debug Payload Generator

Generates request bodies for the UC debug page based on the scenario requested.

---

## Contract References

### /initialize Handshake (what the SPA sends to the BFF):
- **Standalone Tickets:** https://disneyexperiences.atlassian.net/wiki/spaces/DTCC/pages/183635486/DLR+TEP3+-+UI+-+Handshake
- **Packages:** https://disneyexperiences.atlassian.net/wiki/spaces/DTCC/pages/183635614/DLR+TEP3+-+UI+-+Handshake+Spec

### OrderVAS (what the BFF sends to backend — different structure):
- https://github.disney.com/commerce/ecommerce-project-tech-documentation/blob/main/TEP3

### Sample Payloads:
See `context/payloads/` for working examples:
- `standalone-ticket-park-specific.json` — 2-Day 1PPD, adult + child, park-specific
- `package-with-llmp.json` — Package, 2 adults + 1 child, Park Hopper + LLMP
- `room-only.json` — Room Only, 2 adults + 1 child
- `package-mods.json` — Package MOD (existing reservation)
- `room-only-mods.json` — Room Only MOD (existing reservation)

---

## Parameters

| Parameter | Options | Default |
|-----------|---------|---------|
| Product Type | `package` / `room-only` / `standalone-tickets` | Required |
| Flow | `sales` / `mods` | `sales` |
| TEP3 | `true` / `false` | `true` |
| Site | `dlr` / `wdw` | `dlr` |
| Channel | `consumer` / `trade` | `consumer` |
| Party | `{adults: N, children: N}` | `2 adults, 1 child` |
| Park Hopper | `true` / `false` | `false` |
| LLMP | `true` / `false` | `false` |
| Park Agnostic | `true` / `false` | `false` |
| Dates | check-in / check-out or visit dates | Next available |

---

## Generation Logic

1. Start from the matching sample payload in `context/payloads/`
2. Adjust based on parameters:
   - Change party mix (adults/children counts)
   - Add/remove LLMP bundle components
   - Switch parkHopper configuration
   - Remove `parkName` from bundleComponents if park-agnostic
   - Adjust dates
   - Switch between sales/mods flow
3. For **park-agnostic** standalone tickets: bundleComponents must NOT include `parkName`
4. For **mods**: include `existingReservation`, `purchaser`, `guests`, set `orderType: "MOD"`

---

## Output

Present the JSON payload ready to paste into the UC debug page "Full Request Body" field.

Reference `context/environments.md` for debug page URL and mock payment header.

---

## Notes

- For packages: if the offerId is expired, instruct user to redo the lodging sales flow and capture the `/initialize` call from network tab
- The `/initialize` handshake structure is NOT the same as the OrderVAS contract — do not mix them
- Cart IDs and item IDs in sample payloads are examples; they work with mock services but will need real IDs for non-mock environments

---

## TEP3 Product Identification

A product is TEP3 when it has:
- `offerId` — required
- `offerCollectionId` — required
- `bundleComponents` — required for some flows (standalone tickets, packages with tickets), omitted in others (room-only)

Park-agnostic tickets (also called **Baloo**) are TEP3 products whose `bundleComponents` do NOT include `parkName` — only `date`, `displayDate`, `type`, etc.

TEP3 products do **NOT** have `reservations` / `parkReservations`. The park/date info comes from `bundleComponents` instead.

If a payload has `parkReservations`, it is a legacy (non-TEP3) product.
