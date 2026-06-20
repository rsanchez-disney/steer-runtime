# ServiceNow Conventions — Studio PhotoPass (DPI)

## INC Title Format (short_description patterns)

PhotoPass incidents follow consistent naming conventions in ServiceNow:

| Pattern | Format | Example |
|---------|--------|---------|
| PP+ Watermarks | `[Park] - [email] - PP+ Entitlement Failed to Remove Watermarks` | `DLR - guest@email.com - PP+ Entitlement Failed to Remove Watermarks` |
| Black Hole | `[Park] - [email] - Possible Black Hole ([Location])` | `WDW - guest@email.com - Possible Black Hole (AGMC - PFTH Pink D1 Character - Auto)` |
| Camera Issues | `PagerDuty: AGMC: [Location] [Gap] [Issue Type] [Description]` | `PagerDuty: AGMC: Princess Fairytale Hall (PFTH) A2 Camera not taking photos` |
| CM3 Crashes | `CM3 [description of issue], [date], [PC ID]` | `CM3 froze for a period of time then crashed, 6/9/2026, 11:45 AM, PC: WX-MXL32221VK` |
| Memory Finder | `[Park] - Memory Finder - No scan time populations for [date]` | `WDW - Memory Finder - No scan time populations for 6/10/2026` |
| Kiosk Issues | `PagerDuty: AGMC: [Location] [Gap] Association Kiosk issue [Description]` | `PagerDuty: AGMC: Olaf B Association Kiosk issue Error message on Screen` |
| Crop Error | `[Park] - [email] - AGMC Photo Crop Error ([Location]) *[date]*` | `WDW - guest@email.com - AGMC Photo Crop Error (PFTH Pink D2 Character - Auto) 6/12/26` |
| PHOTOBOMB | `[Park] - [email] - AGMC PHOTOBOMB Error ([Location]) *[date]*` | `WDW - guest@email.com - AGMC PHOTOBOMB Error (PFTH Blue A2 Character - Auto) *6/14/2026*` |
| Purchase | `[Park] - [email] - Can't Complete Purchase` | `WDW - guest@email.com - Can't Complete Purchase` |
| Patching | `Pre or Post Patching validation task not closed...` | — |

## State Codes (used in close_notes)

| State | Code | SLA Clock |
|-------|------|-----------|
| New | 1 | Running |
| Assigned | 2 | ⏱️ Running |
| Work in Progress | 3 | ⏸️ Stopped |
| Pending | 4 | ⏸️ Stopped |
| Resolved | 5 | — |
| Closed | 6 | — |

## Close Codes (used by PhotoPass team)

| Close Code | When to Use | Frequency |
|------------|-------------|-----------|
| **Solved (Work Around)** | PP+ watermarks (GS workaround), Black Holes (no photos found), CM3 restarts | ~90% |
| **Solved (Permanently)** | AGMC issues resolved via PagerDuty, kiosk issues fixed | ~8% |
| **Duplicate** | Duplicate PP+ tickets for same guest | ~2% |

## Work Note Format

Standard work note structure for PhotoPass team:

```
[YYYY-MM-DD HH:MM UTC] — Investigation performed by Disney Sustainment Glober team (PhotoPass / L3).
[Description of investigation and findings]
[Resolution or workaround applied]
[Reference to PRB if applicable]
---
```

## Common Close Notes (Copy-Paste Ready)

### PP+ Watermarks (most common)
```
GS team has recovered the incident with a workaround. The team is already working on the solution and is monitoring the issue via PRB0076145
```

### Black Hole — No photos found
```
We investigated this, and unfortunately, no photos were found for this gap at this location. The camera's consecutive trigger count appears to be correct, and no photos are available for this case.
```

### Black Hole — Photos found and linked
```
[X] photos linked to PPID [PPID]. Already claimed and photos are visible on the guest profile.
```

### Camera Issues — Restarted
```
Solved by restarting scene and KM services.
```

### Camera Issues — No errors found
```
I haven't found any specific errors. The poses are being detected normally. The services were restarted just in case.
```

### CM3 Crashes
```
Issue is already taken care by Cast Member. Hence closing the INC.
```

### Memory Finder
```
This was caused by an error with Snowflake. Data was reprocessed and scan times are showing now as expected.
```

### Kiosk
```
Solved by restarting kiosk session.
```

### Photo Crop / PHOTOBOMB
```
It has been reported to the DS team. Resolved by GS and assigned to the respective problem.
```

### Purchase Issues
```
Guest created his order with a second attempt.
```
```
Order in magneto: [order-uuid]
```

## SLA Reference

| Priority | Response | Resolution | PhotoPass Reality |
|----------|----------|------------|-------------------|
| P4 (Normal) | 8 hours | 5 biz days | All PhotoPass INCs are P4 |
| P3 (Medium) | 4 hours | 3 biz days | Rare — only if system-wide outage |
| P2 (High) | 30 min | 8 hours | Very rare — complete PP+ platform down |
| P1 (Critical) | 15 min | 4 hours | Never seen in analyzed period |

## Duplicate Detection

PP+ Watermark tickets are often duplicated (same guest, multiple submissions):
- Check email address across open/recent INCs
- If duplicate found: Link to original, add note "Duplicate ticket (INC_XXXXXXX)", close as Duplicate
