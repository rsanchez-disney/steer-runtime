# Business Rules — TMS DLR

## Ticket/Pass Visibility Rules

A ticket/pass SHOULD be visible when ALL 4 conditions are met:
1. Status is ACTIVE (Status=0 in eGalaxy)
2. End date is in the future (not expired)
3. Remaining usages > 0 (or unlimited for APs)
4. Linked to guest (`primaryGuest` field has a value / SWID)

If all 4 met but not visible → display/sync issue (TMS-to-Keyring publish, app caching, or profile linking).

## Key Business Rules

- **LL/GP Booking:** Tickets must be linked in TMS → ACTIVE → TMS publishes to Keyring(GAM) → GAM shows in GP/LL flow
- **MK Renewal VID Persistence:** VID does NOT change on renewal. Same VID carries over (new SKU, same VID)
- **DLR Expiration Dates:** Come from LEXICON, NOT Galaxy
- **WDW TTC Mods:** Variable Marquee products should be claimable/modifiable via consumer Mods, NOT TTC flow
- **DLR Magic Key LLMP:** `geniePlus: false` is EXPECTED for MK VIDs. MK LLMP is purchased day-of through Titus
- **1-Day Ticket Post-Scan:** `remainingUse=0`, `useCount=1`, status remains ACTIVE (not REDEEMED) for base ticket. Only LLMP supplement set to REDEEMED same day
- **DLR Ticket Modification Pricing (Single SKU with LLMP):** Single SKU tickets use full SKU cost as base for modification pricing (TEP2 logic). Ref: INC28807460

## Key Fields

| Field | Purpose |
|-------|---------|
| `status` | ACTIVE, EXPIRED, BLOCKED |
| `primaryGuest` / `primaryGuestLinked` | SWID linked to ticket |
| `remainingUse` | Remaining usages (0 = used, unlimited for APs) |
| `expirationDate` / `endDateTime` | Ticket expiration |
| `shared` | true/false — whether ticket is in shared state |
| `geniePlus` | For tickets only — MK LLMP goes through Titus |
| `displayInMobile` | Must be true for app visibility |
| `unmanagedGuest` | true = ticket linked AFTER scan (late linking) |


---

## Related Flows

### Flow: Ticket Linking / Claiming

> Guest links tickets to their account so they become visible in the app and reservation flow.

#### Path

```
Guest App (Link Tickets & Passes) → TMS → Keyring → GAM/eGalaxy
```

#### Services Involved

| Step | Service | Role |
|------|---------|------|
| 1 | tms-dlr / tms-wdw | Ticket data + linking state |
| 2 | evas-dlr / evas-wdw | Entitlement view assembly |
| 3 | egalaxy-dlr / gam-wdw | Source of record |
| 4 | gss | Cast ticket lookup and force refresh |

#### Investigation: Tickets Not Visible in App

1. Extract VID(s) and SWID
2. Search TMS by VID — validate 4 visibility conditions
3. Search EVAS by SWID — verify VID present with ACTIVE status
4. Search GSS by VID — verify `ticket.status=ACTIVE`, `ticket.endDateTime` future
5. If all show ACTIVE → transient app display/caching issue. TMS refresh should resolve.

#### Key Scenarios

- **Magic Key Not Linked After Purchase:** `primaryGuest` empty. Guest must manually link via app. NOT a system bug. Ref: INC28819976
- **TMS-to-Keyring Sync Delays:** If no longer reproducible → close as WAD. If still active → TMS-to-Keyring republish. Ref: INC28786197
- **DLR Self Admit Not Displaying:** Check MEP + Self Admit. If `primaryGuestLinked=false` → provide info to `prd-global-tktsrvcs` (MIRS). Ref: INC28962976
- **LLMP Not Showing:** Check eGalaxy QueryTicketResponse for `PackageDetails`. If not returned → known issue PRB0074406. Ref: INC28688436

---

### Flow: Park Reservation (CME)

> Guest creates, modifies, or cancels park reservations at DLR or WDW.

#### TMS Role in Park Reservations

- TMS provides entitlement data to CME Eligibility
- If TMS returns ZERO for a VID → CME cannot determine reservation eligibility
- TMS-to-Keyring publish needed after CME reservation changes for app visibility

#### Key Scenarios

- **Reservations Not Showing in Mobile App (DLR):** Verify VID in TMS (status ACTIVE, primaryGuest populated). Check CME lambda for "Publishing event to Keyring". Ref: INC28975071
- **Expired Fused Ticket with Active Reservation:** eGalaxy propagation delay. `ValidatedExpirationDate: 2079-12-31` at creation time. Escalate to `app-cadlr-galaxy`. Ref: INC28958338

---

### Flow: Magic Key Renewal (DLR)

> Guest renews their Magic Key pass online through the booking service.

#### TMS Role in MK Renewal

- TMS reads eGalaxy's `<Renewable>` flag (not COM Shared API's `renewable` which uses different logic)
- Check `renewable`, `modifiable`, `skipRenewal` flags and `RenewalServiceImpl` messages
- After renewal: TMS-to-Keyring republish needed if linking lost
- **SoCal MK Zip Validation:** Verify in eGalaxy `QueryTicketResponse` that the VID has a zip code in range 90000???93599. If zip is outside this range ??? guest is not eligible for SoCal MK renewal. Route zip discrepancies to `app-cadlr-galaxy`.

#### Key Scenarios

- **Profile Linking Lost After Online Renewal:** `primaryGuestLinked=false` after renewal → eGalaxy linking failure. Route to `app-cadlr-galaxy`. After fix, TMS-to-Keyring republish needed. Ref: INC28969668

---

### Flow: Ticket Upgrade DLR (Ticket-to-Pass)

> Guest upgrades a DLR ticket to Magic Key via EC path. Old VID exchanged in eGalaxy.

#### TMS Role in Ticket Upgrade

- After upgrade: old VID Status=4/5 (exchanged), new VID activated
- TMS reflects updated ticket data from eGalaxy
- CME does NOT auto-transfer reservations — known limitation

#### Key Scenarios

- **Inherited Voided Scans & Stale Expiration Date:** New VID inherits voided scan history. Route to `app-cadlr-galaxy`. NOT a TMS issue. Ref: INC28806827
