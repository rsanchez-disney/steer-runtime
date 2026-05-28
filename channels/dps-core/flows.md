# DPS Core — Flows

## Happy Path: Package Booking
1. Guest searches → Offer Search API (scored results)
2. Guest selects package → Selected Package Offer API
3. Guest proceeds → Quote API (price lock)
4. Guest confirms → Freeze API (inventory hold)
5. Downstream booking service confirms reservation

## Retry/Error Flows
- Quote expired → re-quote with fresh pricing
- Freeze timeout → inventory released, guest must re-freeze
- PAT data stale → calendar-sync refreshes from PAT Authoring
