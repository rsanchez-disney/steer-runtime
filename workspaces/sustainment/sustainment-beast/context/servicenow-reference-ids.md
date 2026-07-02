# 🔧 ServiceNow Reference IDs — Beast Monitoring

**Single Source of Truth** for all AG sys_ids, CI sys_ids, and BAPP ID mappings used in Beast monitoring operations. All hooks and agents reference this file via `#servicenow-reference-ids` — no other file should contain literal sys_id values.

## External Assignment Groups (for reassignment)

> For the complete external systems reference (AGs, sys_ids, contacts, Splunk queries, escalation paths, and DLP apps impacted), use `#external-systems-index` (global/user-level steering file).

Below are the sys_ids needed for ServiceNow API calls when reassigning incidents:

| Assignment Group | Sys ID | Scope / When to Use |
|---|---|---|
| `app-frdlp-web` | `d921b58adb11f3007ac27dc88c961998` | Tridion, Content API, Marketing, header/footer, content changes |
| `ops-frdlp-CloudOps` | `a3bb7cc11b96c09074bc620f6e4bcb28` | Infrastructure, ALB, ECS, deploys, AWS issues |
| `app-frdlp-gfs-support-niv2` | `a421758adb11f3007ac27dc88c9619e4` | Galaxy (critical → create INC) |
| `dba-global-DBEngineering` | `55d31a4f1343578ca8e3b6d96144b0a4` | TMS DB, CME DB, Guest Activity Block, database issues |
| `prd-global-dlp-RMA-park-yield` | `60a1bcd6838ed6901dba70ffeeaad3f8` | PYM / CME availability issues, yield management |
| `prd-global-CRO` | `cdef45b7db82c814784cd498f49619b5` | CRC caller redirect (when caller is "CRC A & S Bus. Tech. & Expert Ass. (JM)") |

## CausedBy Tags — Complete Reference

| Tag | Description |
|---|---|
| `causedByAgilysys` | Agilysys POS vendor issue |
| `causedByAirship` | Push notification delivery failure via Airship |
| `causedByAWSPatching` | A scheduled CHG which will upgrade the version of a component in the AWS infrastructure |
| `causedByBmacs` | BMACS system issue |
| `causedByBug` | Issue caused by logic in the application and needs a fix |
| `causedByCdn` | CDN cache/routing issue (Akamai, CloudFront) |
| `causedByConfiguration` | PYM / Availability / Yield misconfiguration |
| `causedByContentAPI` | Tridion / Content API / product-inventory issue |
| `causedByCoreApi` | Core API layer failure |
| `causedByDocusign` | Docusign integration failure |
| `causedByDRS` | DRS (Dining Reservation System) issue |
| `causedByGalaxy` | Galaxy data issue (missing/corrupt data) |
| `causedByInfra` | Infrastructure: ALB, ECS, AWS, DB infra |
| `causedByInPark` | In-Park systems issue |
| `causedByLineberty` | Lineberty (queue management) issue |
| `causedByMarketing` | Marketing / Tridion content misconfiguration |
| `causedByMPG` | MPG (payment gateway) issue |
| `causedByNetwork` | Network connectivity / routing issue |
| `causedByOneId` | OneID / SSO authentication issue |
| `causedByOnPremises` | On-premises system failure |
| `causedByOpera` | Opera (PMS/OHIP) issue |
| `causedByPending` | Root cause pending investigation |
| `causedByRelease` | A scheduled CHG which will upgrade the version of a service in the Beast scope |
| `causedBySecurity` | Security-related issue (WAF, certs, access) |
| `causedBySBC` | SBC system issue |
| `causedBySparkpost` | Email delivery failure via Sparkpost |
| `causedByTbx` | TravelBox booking data issue |
| `causedByTitus` | Titus system issue |
| `causedByWorldpay` | Worldpay payment processing issue |

### Resolution Tags (no external root cause)

| Tag | Description |
|---|---|
| `notReproducible` | We can't verify the issue exists |
| `workingAsExpected` | We verified the behavior is correct/intended |

---

## Root Cause → Assignment Group Mapping

> For the full root cause → reassignment guide including contacts and escalation channels, see `#external-systems-index` (global/user-level steering file).

Quick decision guide for ServiceNow reassignment:

| Root Cause Category | CausedBy Tag | Reassign To |
|---|---|---|
| Tridion / Content API / product-inventory | `causedByContentAPI` | `app-frdlp-web` |
| Infrastructure / ALB / ECS / AWS | `causedByInfra` | `ops-frdlp-CloudOps` |
| Galaxy data issues | `causedByGalaxy` | `app-frdlp-gfs-support-niv2` |
| Database (TMS DB, CME DB) | `causedByInfra` | `dba-global-DBEngineering` |
| PYM / Availability / Yield | `causedByConfiguration` | `prd-global-dlp-RMA-park-yield` |
| Marketing / Tridion content | `causedByMarketing` | `app-frdlp-web` |
| Network / CDN | `causedByNetwork` or `causedByCdn` | `ops-frdlp-CloudOps` |
| OneID / SSO | `causedByOneId` | Escalate via DGE Train |
| TBX / Booking data | `causedByTbx` | TravelBox Ops (Teams) |
| Release / Deployment | `causedByRelease` | Squad that owns the app |
| Bug in code | `causedByBug` | Squad that owns the app |
| Can't verify issue exists | `notReproducible` | Close — no reassignment needed |
| Behavior is correct/intended | `workingAsExpected` | Close — no reassignment needed |

## DLP Squad Assignment Groups (Complete)

Beast monitors incidents and changes across all DLP squads. Source: [⚔️ DLP Squads](https://mywiki.disney.com/spaces/SBH/pages/853970077/%E2%9A%94%EF%B8%8F+DLP+Squads)

| Project | Squad | Assignment Group | Sys ID | Scope |
|---|---|---|---|---|
| DGE | Beast (primary) | `app-frdlp-digital-ext-support` | `8e7be6f6c36a8e5416d7f6aa05013138` | Monitoring coordination, escalation |
| DGE | Cruz Ramirez | `app-frdlp-BaseAPP` | `e3279f1d87928d10ee71a18e0ebb350b` | Mobile App, BFF |
| DGE | Cruz Ramirez | `app-frdlp-resort-dge` | `db571b5d87928d10ee71a18e0ebb35ee` | Magic Mobile, OLCI, Digital Key |
| DGE | Cruz Ramirez | `app-frdlp-food-dge` | `21771f5d87928d10ee71a18e0ebb35ed` | Book Dine, Mobile Order, Disability Card |
| DGE | Storm | `app-frdlp-attraction-dge` | `2547175d87928d10ee71a18e0ebb3554` | Orion, DPA Ultimate, Virtual Queue, Meet & Greet, Bio Services, Maps |
| DGE | Storm | `app-frdlp-guestprofile` | `897f14addb7b4890784cd498f496198b` | Guest Profile, Keyring, Wallet, Ticket Linking, TMS |
| — | Forky (ARS/CME) | `app-frdlp-ARS` | `cc9fdd8bdbf6989884e141a405961932` | ARS, CME |

### All DLP Squad AG Sys IDs (for ServiceNow encoded queries)

```
8e7be6f6c36a8e5416d7f6aa05013138,e3279f1d87928d10ee71a18e0ebb350b,db571b5d87928d10ee71a18e0ebb35ee,21771f5d87928d10ee71a18e0ebb35ed,2547175d87928d10ee71a18e0ebb3554,897f14addb7b4890784cd498f496198b
```

**Encoded query string (AG-based strategy):**
```
assignment_group.sys_idIN8e7be6f6c36a8e5416d7f6aa05013138,e3279f1d87928d10ee71a18e0ebb350b,db571b5d87928d10ee71a18e0ebb35ee,21771f5d87928d10ee71a18e0ebb35ed,2547175d87928d10ee71a18e0ebb3554,897f14addb7b4890784cd498f496198b
```

## DLP Configuration Items — Complete (CI-based strategy)

CIs (Configuration Items) in ServiceNow represent the applications monitored by DLP squads. Use these to find INCs/CHGs that affect our apps even if assigned to other groups.

### Cruz Ramirez CIs

| CI Name | Sys ID | Squad AG |
|---|---|---|
| DLP Mobile App | `dccc0fec1b1a78d048b7da01dd4bcb1e` | app-frdlp-BaseAPP |
| DLP Mobile BFF CORE | *(search by name — parent CI)* | app-frdlp-BaseAPP |
| DLP DGE API.Magic Mobile Ticket Meal Plan | `8010d2aa877221903cd284c7cebb3532` | app-frdlp-resort-dge |
| DLP OLCI | `d18c83ac1b1a78d048b7da01dd4bcb79` | app-frdlp-resort-dge |
| DLP DGE API.DigitalKey | `838c07ac1b1a78d048b7da01dd4bcbfe` | app-frdlp-resort-dge |
| DLP API DGE.BOOK DINE | `c8dcc3201b5a78d048b7da01dd4bcb00` | app-frdlp-food-dge |
| DLP DGE API.MobileOrder | `702d0fa01b5a78d048b7da01dd4bcbdd` | app-frdlp-food-dge |
| DLP DGE API.DisabilityCard | `966c436c1b1a78d048b7da01dd4bcbed` | app-frdlp-food-dge |

### Storm CIs

| CI Name | Sys ID | Squad AG |
|---|---|---|
| DLP DGE API.ORION services | `22cc03201b5a78d048b7da01dd4bcbd4` | app-frdlp-attraction-dge |
| DLP Disney Premier Access Ultimate | `be33a150873a81903d83311d0ebb35a2` | app-frdlp-attraction-dge |
| DLP Virtual Queue | `5c62256887454d142e2fbaa8cebb3558` | app-frdlp-attraction-dge |
| DLP DGE API.MeetAndGreet | `42accfac1b1a78d048b7da01dd4bcbef` | app-frdlp-attraction-dge |
| DLP DGE API.BIO Services | `81dc47201b5a78d048b7da01dd4bcb1b` | app-frdlp-attraction-dge |
| DLP DGE API.MAPS Services | `1d0b021a873669503cd284c7cebb3548` | app-frdlp-attraction-dge |
| DLP Guest Extended Profile | `df7c0f6c1b1a78d048b7da01dd4bcb43` | app-frdlp-guestprofile |
| DLP Guest CRM Event Publisher | `94bc07ec1b1a78d048b7da01dd4bcb0b` | app-frdlp-guestprofile |
| DLP Keyring | `b02d0fa01b5a78d048b7da01dd4bcb75` | app-frdlp-guestprofile |
| DLP Wallet Server Proxy Provider | `5398ac9f8757c5d06bf1426d0ebb3544` | app-frdlp-guestprofile |
| DLP Ticket Linking Services | `eaac03ec1b1a78d048b7da01dd4bcbe0` | app-frdlp-guestprofile |
| DLP Ticket Management Service | `20dcc3201b5a78d048b7da01dd4bcbc0` | app-frdlp-guestprofile |
| DLP TMS | `a4a6099687bb78104f48873e0ebb3584` | app-frdlp-guestprofile |
| DLP DGE API.Guest Activity Block | `5b41724c8781395032f5a86d0ebb35c6` | app-frdlp-guestprofile |
| DLP Guest Membership Provider | `28ba7ee9c34f7990bd2269deb00131fa` | app-frdlp-guestprofile |

### All DLP CI Sys IDs (for ServiceNow encoded queries)

```
dccc0fec1b1a78d048b7da01dd4bcb1e,8010d2aa877221903cd284c7cebb3532,838c07ac1b1a78d048b7da01dd4bcbfe,d18c83ac1b1a78d048b7da01dd4bcb79,c8dcc3201b5a78d048b7da01dd4bcb00,702d0fa01b5a78d048b7da01dd4bcbdd,966c436c1b1a78d048b7da01dd4bcbed,22cc03201b5a78d048b7da01dd4bcbd4,be33a150873a81903d83311d0ebb35a2,5c62256887454d142e2fbaa8cebb3558,42accfac1b1a78d048b7da01dd4bcbef,81dc47201b5a78d048b7da01dd4bcb1b,1d0b021a873669503cd284c7cebb3548,df7c0f6c1b1a78d048b7da01dd4bcb43,94bc07ec1b1a78d048b7da01dd4bcb0b,b02d0fa01b5a78d048b7da01dd4bcb75,5398ac9f8757c5d06bf1426d0ebb3544,eaac03ec1b1a78d048b7da01dd4bcbe0,20dcc3201b5a78d048b7da01dd4bcbc0,a4a6099687bb78104f48873e0ebb3584,5b41724c8781395032f5a86d0ebb35c6,28ba7ee9c34f7990bd2269deb00131fa,56cc03201b5a78d048b7da01dd4bcb7a,04f14b86c3d7865cbac2ff0d05013197,0673b286c313865cbac2ff0d05013185,318afa0ec3d3865cbac2ff0d05013127,93cc83201b5a78d048b7da01dd4bcb32,1e9c4bac1b1a78d048b7da01dd4bcbb8,b38c47ac1b1a78d048b7da01dd4bcbd0,c57c876c1b1a78d048b7da01dd4bcb73
```

**Encoded query string (CI-based strategy):**
```
cmdb_ci.sys_idINdccc0fec1b1a78d048b7da01dd4bcb1e,8010d2aa877221903cd284c7cebb3532,838c07ac1b1a78d048b7da01dd4bcbfe,d18c83ac1b1a78d048b7da01dd4bcb79,c8dcc3201b5a78d048b7da01dd4bcb00,702d0fa01b5a78d048b7da01dd4bcbdd,966c436c1b1a78d048b7da01dd4bcbed,22cc03201b5a78d048b7da01dd4bcbd4,be33a150873a81903d83311d0ebb35a2,5c62256887454d142e2fbaa8cebb3558,42accfac1b1a78d048b7da01dd4bcbef,81dc47201b5a78d048b7da01dd4bcb1b,1d0b021a873669503cd284c7cebb3548,df7c0f6c1b1a78d048b7da01dd4bcb43,94bc07ec1b1a78d048b7da01dd4bcb0b,b02d0fa01b5a78d048b7da01dd4bcb75,5398ac9f8757c5d06bf1426d0ebb3544,eaac03ec1b1a78d048b7da01dd4bcbe0,20dcc3201b5a78d048b7da01dd4bcbc0,a4a6099687bb78104f48873e0ebb3584,5b41724c8781395032f5a86d0ebb35c6,28ba7ee9c34f7990bd2269deb00131fa,56cc03201b5a78d048b7da01dd4bcb7a,04f14b86c3d7865cbac2ff0d05013197,0673b286c313865cbac2ff0d05013185,318afa0ec3d3865cbac2ff0d05013127,93cc83201b5a78d048b7da01dd4bcb32,1e9c4bac1b1a78d048b7da01dd4bcbb8,b38c47ac1b1a78d048b7da01dd4bcbd0,c57c876c1b1a78d048b7da01dd4bcb73
```

## BAPP ID Mappings

| BAPP ID | Application Name | Description |
|---|---|---|
| BAPP0225827 | MySQL RDS | Database infrastructure |
| BAPP0201208 | TMS | Ticket Management Service |
| BAPP0203964 | Ticket Linking Services | Ticket linking between systems |
| BAPP0175566 | Harness/Deployment support | Deployment support tooling |

## ServiceNow Incident States

| State Code | Name | Description |
|---|---|---|
| 1 | New | Just created |
| 6 | Resolved | Issue resolved |
| 7 | Closed | Fully closed |
| 10 | Assigned | Assigned to AG, no individual yet |
| 11 | Work in Progress | Being worked on |
| 12 | Pending Vendor | Waiting on external vendor |
| 13 | Pending Customer | Waiting on customer/caller |
| 14 | Canceled | Canceled |
| 700 | Pending Change | Waiting for a CHG to be deployed |
| 704 | Pending Validation | Waiting for validation after fix |

## Reassignment Checklist

When reassigning an INC to an external AG:

1. ✅ Add work note with root cause summary and action required for receiving team
2. ✅ Change `assignment_group` to target AG sys_id
3. ✅ Clear `assigned_to` (set to empty string)
4. ✅ Add tag `reviewedByBeastTeam`
5. ✅ Add appropriate `causedBy*` tag
6. ✅ Post in Incidents channel (DGE or ECO) using "Reassigned to other AG" template

## INC Closure Checklist

When closing an INC owned by Beast:

1. ✅ Verify spike dropped to 0 / issue doesn't persist
2. ✅ Add squad tag (e.g., `beastXForky`, `beastXCruzRamirez`, `beastXStorm`)
3. ✅ Add `causedBy*` tag
4. ✅ Set Close Code, Cause Code Area, Cause Code SubArea
5. ✅ Set Caused by Change: `CHG_UNDOC` or `CHG_NOCHG`
6. ✅ Add final report work note (INC Final Report HTML template)
7. ✅ Post in Incidents channel using "Closed by Beast" template

*Last Updated: 2026-06-14*
