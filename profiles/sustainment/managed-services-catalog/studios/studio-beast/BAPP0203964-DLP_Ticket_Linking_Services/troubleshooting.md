# Troubleshooting — DLP Ticket Linking Services

## Common Issues

### Issue: Ticket linking/unlinking failing

**Symptoms:** Guests cannot link or unlink tickets to their accounts.

**Root Cause:** Tickets Linking Provider ECS service down or TMS unavailable.

**Resolution:** Check ECS service `tms-tickets-linking-provider-prod-live` health. Verify TMS (BAPP0201208) is healthy. Check Splunk "Ticket Linking Provider" dashboard.

---

### Issue: Park Entry BookingID Provider — reservation not visible in Galaxy

**Symptoms:** Package verification failing for recent reservations.

**Root Cause:** Reservation not yet visible in Galaxy database. Known issue with `wdpr-dlp-is-booking-ooc-reservation-publisher`. Source: SMARTMEDIA.

**Resolution:** Wait for Galaxy sync. If persistent, check booking-ooc-reservation-publisher logs. Verify Galaxy database connectivity from on-prem server.

---

### Issue: Park Entry BookingID Provider — cannot connect to Galaxy

**Symptoms:** All package verifications failing. Stored procedure DLRP_ListeResa not executing.

**Root Cause:** On-prem server connectivity to Galaxy database lost.

**Resolution:** Check on-prem server health (vl-frmv-rhe***). Verify Galaxy database availability. Check Splunk "Park-Entry BookingID Provider" dashboard.

---

## Escalation Decision Tree

- If Ticket Linking ECS issue → Cloud OPS
- If Galaxy database issue → Galaxy/infrastructure team
- If on-prem Park Entry BookingID issue → on-prem infrastructure team
- If application logic → Luigi Squad (app-frdlp-guestprofile)

## Known Quirks

- Park Entry BookingID Provider is ON-PREM (not AWS)
- Known issue with reservation visibility timing in Galaxy (SMARTMEDIA source)
- Two separate deployment models: AWS ECS + on-prem
