# Studio PhotoPass (DPI) — Team Context

> **Last verified: 2026-06-19** — Based on 80+ resolved ServiceNow incidents analysis.

## Assignment Group & On-Call

- **AG**: app-flwdw-dpi
- **On-Call Phone**: +1 934 647 4549
- **Parks Supported**: WDW (Walt Disney World) + DLR (Disneyland Resort) + DCL (Disney Cruise Line)
- **Alert Source**: PagerDuty (AGMC alerts) + Guest Services (PP+ entitlement issues)

## ServiceNow

- **Assignment Group**: app-flwdw-dpi
- **Category**: Software
- **Subcategory**: Application
- **Contact Type**: Event Management (PagerDuty) / Guest Contact (PP+)
- **Related PRB**: PRB0076145 (PP+ Watermark Removal — recurring DLR bug)

## BAPPs (Business Applications) — 12 Managed

| BAPP ID | Application | Criticality | Region |
|---------|-------------|-------------|--------|
| BAPP0013982 | DPI CinCo | 🟡 MEDIUM | us-east-1 + us-west-2 |
| BAPP0080709 | DPI Image & Guest Data repo DLR | 🟡 MEDIUM | us-west-2 |
| BAPP0133759 | DPI Image & Guest Data repo WDW | 🟡 MEDIUM | us-east-1 |
| BAPP0083540 | DPI Media Zip File Creator DLR | 🟢 LOW | us-west-2 |
| BAPP0083553 | DPI Media Zip File Creator WDW | 🟢 LOW | us-east-1 |
| BAPP0085042 | DPI Buzz Ride Takeaway Generation | 🟡 MEDIUM | us-east-1 |
| BAPP0088062 | DPI Coco Mexico Pavilion Interactive | 🟢 LOW | us-east-1 |
| BAPP0129249 | DPI PhotoBooth Ingest | 🟡 MEDIUM | us-east-1 + us-west-2 |
| BAPP0167620 | DPI Picsolve Panorame | 🟢 LOW | us-east-1 |
| BAPP0216267 | DPI DCL Shoreside | 🟡 MEDIUM | us-east-1 |
| BAPP0225739 | DPI DCL Onboard | 🟠 HIGH | Multi-ship |
| BAPP0234023 | DPI DCL Fuji Interface | 🟡 MEDIUM | us-east-1 |

## Key Systems & Tools

| System | Purpose | Used For |
|--------|---------|----------|
| **AGMC** | Automated Guest Magic Camera | In-park automated photo capture |
| **CM3** | Cast Member tool | Photo moderation, search, linking |
| **Magneto** | Commerce/Order system | PhotoPass+ purchases, order management |
| **Memory Finder** | Guest photo discovery | Scan time populations, photo association |
| **PFTH** | PhotoFirst Touch Hub | Camera session management at character meets |
| **Snowflake** | Data pipeline | ETL for scan times and Memory Finder |
| **PagerDuty** | Alert management | AGMC camera and kiosk alerts |

## Locations (AGMC Cameras)

| Location Code | Full Name | Park |
|---------------|-----------|------|
| PFTH A1/A2 | Princess Fairytale Hall — Gap A | WDW Magic Kingdom |
| PFTH B1/B2 | Princess Fairytale Hall — Gap B | WDW Magic Kingdom |
| PFTH C1/C2 | Princess Fairytale Hall — Gap C (Blue) | WDW Magic Kingdom |
| PFTH D1/D2 | Princess Fairytale Hall — Gap D (Pink) | WDW Magic Kingdom |
| TST A/B | Town Square Theater (Mickey) | WDW Magic Kingdom |
| Frozen A/B/C | Frozen Character Meet | WDW Epcot |
| Olaf A/B | Olaf Meet & Greet | WDW Epcot |
| PAN | Pandora — Floating Mountains | WDW Animal Kingdom |
| Boathouse | Disney Springs Boathouse | WDW Disney Springs |
| TS Theater | Toy Story Theater | WDW Hollywood Studios |
| Tiana | Tiana's Bayou Adventure (ride) | WDW Magic Kingdom |

## Routing / Reassignment Groups

| Root Cause Category | Reassign To |
|---------------------|-------------|
| PP+ Watermark / Entitlement (DLR) | Retain in **app-flwdw-dpi** (workaround via GS, tracked PRB0076145) |
| AGMC Camera Issues (freeze/reset/black hole) | Retain in **app-flwdw-dpi** |
| AGMC Kiosk Issues (Windows logo, errors) | Retain in **app-flwdw-dpi** |
| Memory Finder / Snowflake ETL | Retain in **app-flwdw-dpi** |
| CM3 Performance / Crashes | Retain in **app-flwdw-dpi** (self-resolving) |
| Photo Crop Error / PHOTOBOMB | Report to DS team → **app-flwdw-dpi** |
| Can't Complete Purchase (Magneto) | Retain in **app-flwdw-dpi** |
| Hardware issue (camera replacement) | Escalate to **E-Team** (Entertainment/Ops) |
| Network / Infrastructure | **ops-global-parks-se-guestexp** |
| Login / Identity | Jira **IDY-*** |

## Alert Channels

| Severity | Source | Action |
|----------|--------|--------|
| P1/P2 | PagerDuty (major system outage) | Phone + Slack + Bridge |
| P3 | PagerDuty (AGMC camera/kiosk) | Auto-INC → triage |
| P4 | Guest Services (PP+ watermarks) | Batch review → workaround |

## Volume Distribution (from 80+ INCs analyzed, June 2026)

| Pattern | Count | % of Volume |
|---------|-------|-------------|
| PP+ Watermark Removal Failed | ~42 | 52% |
| Possible Black Hole (Photos Missing) | ~16 | 20% |
| AGMC Camera Issues (freeze/reset) | ~8 | 10% |
| CM3 Crashes/Performance | ~6 | 7% |
| Memory Finder (Snowflake) | ~4 | 5% |
| Photo Crop / PHOTOBOMB Error | ~3 | 4% |
| Can't Complete Purchase | ~3 | 4% |
| Kiosk Issues | ~3 | 4% |
| Patching Validation | ~1 | 1% |
