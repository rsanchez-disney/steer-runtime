# Business Rules — DLP Mobile App

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | High availability (guest-facing) | AppDynamics / Health Check |
| Response time (p95) | Monitored via AppDynamics | AD-AAB-ABJ-AFD (Android) / AD-AAB-ABJ-AFE (iOS) |
| Error rate | Monitored via AppDynamics | PROD dashboards |

## Peak Periods

- Park opening hours — highest app usage
- Park peak days (weekends, holidays, special events)
- Check-in periods for hotel guests (OLCI usage spikes)

## Business Logic

- Users can make hotel reservations and purchase packages
- Users can book shows and meal plans
- Users can access personal account information and digital passes
- Park check-in (OLCI) allows guests to complete check-in digitally
- Digital Key uses Bluetooth to authenticate at electronic locks for room access
- Avatar feature allows guests to customize their account with a selected avatar
- Caching Policy applies to app content

## Core Features

- **Hotel Reservations** — book and manage hotel stays
- **Package Purchases** — buy park/hotel packages
- **Show & Meal Plan Bookings** — reserve entertainment and dining
- **Digital Passes** — access park entry and attraction passes
- **OLCI (Online Check-In)** — complete park check-in digitally
- **Digital Key** — Bluetooth-based room access
- **Magic Mobile** — digital wallet for park experiences
- **Magic Pass** — park entry and attraction access
- **Virtual Queue** — join attraction queues virtually
- **Disney Premier Access** — premium attraction access
- **Meet and Greet** — character meet bookings
- **Book Dine** — restaurant reservations
- **Mobile Order** — Click & Collect food ordering
- **Wait Times** — real-time attraction wait times
- **Park Schedules** — operating hours and show times
- **Push Notifications** — guest alerts and reminders

## Dependencies

- **OLCI Service (BAPP0211386)** — Online Check-In V2
- **Digital Key Service (BAPP0220148)** — DLP Digital Key
- **Mobile BFF Core** — Backend-for-Frontend core service
- **Tridion Content API** — Content management
- **AppDynamics** — Monitoring (Android: AD-AAB-ABJ-AFD, iOS: AD-AAB-ABJ-AFE)

## Impact Classification

- **Full outage:** App completely unavailable — guests cannot access any mobile services (reservations, digital passes, check-in, room access)
- **Degraded:** Specific features unavailable (e.g., Digital Key down but rest of app works; OLCI unavailable but passes still accessible)
- **Critical features:** Digital Key (room access), OLCI (check-in), Digital Passes (park entry)
