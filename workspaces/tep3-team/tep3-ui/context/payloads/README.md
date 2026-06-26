# UC Debug Payload References

## Contract Documentation

### OrderVAS (backend expects):
- https://github.disney.com/commerce/ecommerce-project-tech-documentation/blob/main/TEP3

### /initialize Handshake (what UC SPA sends):
- **Standalone Tickets:** https://disneyexperiences.atlassian.net/wiki/spaces/DTCC/pages/183635486/DLR+TEP3+-+UI+-+Handshake
- **Packages:** https://disneyexperiences.atlassian.net/wiki/spaces/DTCC/pages/183635614/DLR+TEP3+-+UI+-+Handshake+Spec

> **Note:** The OrderVAS contract is what the BFF sends to the backend. The /initialize handshake is what the SPA sends to the BFF. They are different structures.

## Sample Payloads

| File | Scenario |
|------|----------|
| `standalone-ticket-park-specific.json` | 2-Day 1PPD, adult + child, park-specific (with parkName) |
| `package-with-llmp.json` | Package, 2 adults + 1 child, Park Hopper + LLMP |
| `room-only.json` | Room Only, 2 adults + 1 child |
| `package-mods.json` | Package MOD (existing reservation) |
| `room-only-mods.json` | Room Only MOD (existing reservation) |
