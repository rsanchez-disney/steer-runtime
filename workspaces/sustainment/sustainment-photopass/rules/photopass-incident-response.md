# PhotoPass Incident Response Format

## Mandatory 8-Section Response

When analyzing a PhotoPass (DPI) incident, ALWAYS respond with exactly 8 sections in this order:

---

### --- SECTION 1: Incident Understanding ---

Explain:
- **Guest/Cast Perspective**: What is the guest or Cast Member experiencing?
- **Technical Translation**: What system/component is likely failing?
- **Who Is Affected**: Scope (single guest, park-wide, all parks?)

For PhotoPass, identify:
- Park: WDW or DLR
- Pattern: Which of the 8 known patterns does this match?
- Location: Which camera gap, kiosk, or system?

---

### --- SECTION 2: Probable Cause ---

Present hypotheses in a table:
| # | Hypothesis | Failure Mode | Why It Fits |

For PhotoPass, the top causes are:
1. PP+ entitlement propagation failure (52% of volume)
2. Camera gap with no captured photos (black hole)
3. Camera hardware/software freeze (PFTH/KM service)
4. Snowflake ETL pipeline failure (Memory Finder)
5. CM3 application crash (self-resolving)

---

### --- SECTION 3: 3-Step Resolution ---

Structure as:
- **Step 1 — Identify** (read INC, match pattern)
- **Step 2 — Validate** (Splunk query or system check)
- **Step 3 — Resolve** (apply known resolution path)

For most PhotoPass incidents, resolution follows established patterns:
- PP+ Watermarks → GS workaround, reference PRB0076145
- Black Hole → Check trigger count, confirm no photos available
- Camera → Restart scene/KM services
- Memory Finder → Reprocess Snowflake batch
- CM3 → Already self-resolved by Cast Member

---

### --- SECTION 4: Related Incidents ---

- Check for duplicate INCs (same guest email for PP+)
- Reference PRB0076145 for all watermark issues
- Note if same camera/location has recurring issues
- Provide ServiceNow search query template

---

### --- SECTION 5: ServiceNow Documentation (Technical Note) ---

Provide a copy-paste ready work note using the team's standard templates:
- PP+: Reference PRB0076145 and GS workaround
- Black Hole: State investigation findings (photos found/not found)
- Camera: Document restart actions taken
- CM3: Note self-resolution by Cast Member

Format as:
```
[timestamp] — Investigation performed by Disney Sustainment Glober team (PhotoPass / L3).
[findings and actions]
[resolution or next steps]
---
```

---

### --- SECTION 6: Reassignment Groups (Routing) ---

| Condition | Routing |

For PhotoPass, 95%+ of incidents are **retained in app-flwdw-dpi**:
- PP+ Watermarks → retain (workaround)
- Black Hole → retain (investigation)
- Camera/Kiosk → retain (restart)
- CM3 → retain (self-resolved)
- Memory Finder → retain (reprocess)

Escalation paths (rare):
- Hardware failure → E-Team (Entertainment Operations)
- Network/infra → ops-global-parks-se-guestexp
- Login/Auth → Jira IDY-*

---

### --- SECTION 7: Confidence & Caveats ---

Rate confidence:
| Item | Status |

Confidence levels:
- 🟢 **High** — Pattern clearly matched from title + known resolution
- 🟡 **Medium** — Pattern likely but needs Splunk validation
- 🔴 **Low** — Insufficient data or new/unknown issue type

PhotoPass has HIGH pattern predictability — 96% match rate with 8 known patterns.

---

### --- SECTION 8: Quick Actions Summary ---

| Action | Detail |

Standard quick actions for PhotoPass:
- 📋 Move to WIP in ServiceNow
- 🔍 Run pattern-specific Splunk query
- 📝 Paste standard work note
- 🔀 Routing decision (almost always retain)
- ✅ Close with correct close code

---

## MCP Integration Rules

When MCP tools are available:
1. **ALWAYS** read the INC first (ServiceNow MCP → Get ticket)
2. Match pattern from short_description keywords
3. Apply standard resolution based on matched pattern
4. Write work note (ServiceNow MCP → Add work note)
5. Resolve if standard resolution applies (most PhotoPass INCs)

## Key Decision Points

- **PP+ Watermark**: Is this DLR? → Yes = known PRB0076145 → GS workaround → close
- **Black Hole**: Check trigger count → If correct, no photos exist → close
- **Camera**: Restart services → If persists after restart → hardware escalation
- **CM3**: Cast Member already restarted? → Yes → close immediately
- **Memory Finder**: Which date affected? → Reprocess in Snowflake → verify → close
