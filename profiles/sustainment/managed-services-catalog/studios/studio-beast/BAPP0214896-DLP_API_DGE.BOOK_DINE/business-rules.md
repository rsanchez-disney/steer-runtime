# Business Rules — DLP API DGE.BOOK DINE

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | High availability (guest-facing) | Healthcheck Manager |
| Response time (p95) | Monitored via AppDynamics | PROD_DLP_PAAP_SALES-BOOKDINE |
| Error rate | Monitored via Splunk | wdpr-dlp-is-sales-drs-book-dine-provider |

## Peak Periods

- Meal times (breakfast, lunch, dinner booking windows)
- Park opening hours — guests planning their day
- Holiday/event periods — higher restaurant demand

## Business Logic

### Booking Rules
- Regular guests: can book up to 62 days in the calendar
- Guests with hotel reservation: can book until hotel reservation dates (max 365 days, limited by DRS horizon period)
- Bio Schedules DB returns data only for next 12 months
- On the day: arrive at chosen time, table held for up to 15 minutes
- Bookings can be cancelled
- No payment required in the application

### Two Entry Points (Flows)
- **Classique:** Guest selects a restaurant → date → time slot
- **Discovery:** Guest selects meal type (Breakfast/Brunch/Lunch/Dinner) → date → time slots grouped by restaurant

### Redis RateLimiter
- Stored in Redis (external component)
- Limits number of calls from unexpected clients
- Allows or rejects requests

### PPD (Prince or Princess for the day)
- Reuses the BookDine flow (same backend, different frontend)
- Any BookDine incident may also impact PPD

## Dependencies

### Beast Scope (Internal)
- **Notification Service (BAPP0225827)** — reservation emails
- **Keyring (BAPP0177699)** — guest ticket data
- **Guest Extended Profile (BAPP0177719)** — guest profile data
- **Bio Schedules** — restaurant opening hours

### External
- **DRS** — System of Record for all restaurant bookings and inventory (app-frdlp-support-pos)
- **Content API** — restaurant content
- **Redis** — rate limiting
- **Sparkpost** — email delivery
- **Airship** — push notifications (Publisher)

## Impact Classification

- **Provider down:** Guests cannot create/update/cancel table reservations
- **Publisher down:** Guests don't receive email reminders for upcoming reservations
- **DRS down:** All digital reservations unavailable
- **Notification Service down:** No reservation emails
- **Bio Schedules down:** Cannot search restaurant opening hours
