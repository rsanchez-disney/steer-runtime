# Business Rules — DLP DGE API.DigitalKey

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Critical (guest room access) | CloudWatch DLP Mobile App Dashboard |
| Response time | Real-time (Bluetooth interaction) | AppDynamics |

## Pre-conditions

- Mobile Check-in (OLCI) completed (available 7 days before arrival until day before)
- Reservation linked to user's account in the app
- Arrival date (D Day)
- Magic Mobile feature flag: ON (in Opera)
- Bluetooth enabled on device
- Location enabled (Android only)

## Business Rules

### Eligible Hotels
- Disney Hotel New York – The Art of Marvel
- Disneyland Hotel

### Activation Flow
- On arrival day (DD): "I'm here" CTA appears
- Guest completes onboarding, activates Digital Key
- Once activated: "Open Door" CTA available with room number

### Limitations
- Bookings made 3 days or less before arrival → require front desk check-in to activate
- Last-minute reservations: Magic Mobile Feature Flag may be OFF → must enable in Opera
- Push notification sent on arrival day morning (~10:00 AM)

### Shared Key / Multi-Room
- Two rooms assignment supported
- Shared Key Mode available for multi-room bookings
- Each room gets its own key, created step by step

## Dependencies

- **CISA Electronic Locks** — 3 servers (DCR, NY, DL) managing physical locks
- **Opera Cloud** — reservation validation, room assignment, Magic Mobile flag
- **OLCI (BAPP0211386)** — pre-condition for Digital Key activation
- **Bluetooth** — device-level requirement for lock interaction

## Impact Classification

- **Full outage:** Guests cannot access rooms via phone — must use physical key from front desk
- **CISA servers down:** Cannot retrieve eligible rooms
- **Opera Cloud down:** Cannot validate reservation/room assignment
- **Security risk:** If validation fails, potential wrong room access
