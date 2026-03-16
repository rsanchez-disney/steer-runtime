# DPAY Tickets Summary

## DPAY-14310: Config Studio | MVP4 | Deterministic Prefix Builder & Canonical Format

**Status:** Dev in Progress  
**Assignee:** Sanchez, Ricardo  
**Priority:** 2 - High  
**Created:** February 10, 2026

### Description
Implement the deterministic prefix construction and canonical format rules for Client IDs. Resolve SOR codes to acronyms, assemble `{SOR_ACRONYM}-{SITE}-{OPTIONAL_FIELDS}` in a predictable, sorted order, and exclude empty values. This story delivers the core format logic used by preview and final generation.

### Acceptance Criteria

**AC1 – Canonical Format**
- Given SOR and Site are provided
- When a Client ID is generated
- Then the result follows `{ACRONYM}-{SITE}-{SEQUENCE}` with single dashes and zero‑padded 4‑digit sequence.

**AC2 – Optional Fields Inclusion**
- Given Channel Type and User Type are provided
- When the prefix is constructed
- Then the format is `{ACRONYM}-{SITE}-<optional fields in deterministic order>-{SEQUENCE}` and no empty dashes appear.

**AC3 – SOR Acronym Resolution**
- Given a SOR code is provided
- When it is resolved
- Then the current acronym is used; and if mapping is missing, fallback uses the SOR code with a warning logged.

**AC4 – Optional Fields Determinism**
- Given optional and conditional fields exist
- When the prefix is constructed
- Then optional fields are included in fixed order and conditional fields in alphabetical order by key; empty/null values are excluded.

**AC5 – Optional Fields Exclusion**
- Given optional fields are empty or null
- When the prefix is constructed
- Then the format remains clean with no extra dashes.

**Documentation:** [Client ID Prefix Generation Engine](https://confluence.disney.com/spaces/Payments/pages/2042674133/Story+2.8+%E2%80%94+Client+ID+Prefix+Generation+Engine)

---

## DPAY-14311: Config Studio | MVP4 | Atomic Sequence Generation & Uniqueness

**Status:** Dev in Progress  
**Assignee:** Sanchez, Ricardo  
**Priority:** 2 - High  
**Created:** February 10, 2026

### Description
Deliver the thread‑safe, atomic sequence generator that guarantees uniqueness and ordering per prefix. Includes the database schema for `client_id_sequences` and zero‑padded sequence formatting.

### Acceptance Criteria

**AC1 – Sequence Uniqueness per Prefix**
- Given two requests with the same prefix
- When processed sequentially or concurrently
- Then each receives a unique sequence number (e.g., `0001`, `0002`) with no duplicates.

**AC2 – Atomic Concurrency**
- Given multiple concurrent requests on the same prefix
- When they execute
- Then the generator assigns unique numbers atomically with no race conditions.

**AC3 – Zero‑Padding Format**
- Given any generated sequence number
- When the Client ID is returned
- Then the sequence is zero‑padded to 4 digits (e.g., `0010`, `0100`) and consistent across generations.

**Resilience**
- Given a failure occurs after sequence increment
- When a retry happens
- Then no duplicate numbers are issued (gaps acceptable; order preserved).

**Documentation:** [Client ID Prefix Generation Engine](https://confluence.disney.com/spaces/Payments/pages/2042674133/Story+2.8+%E2%80%94+Client+ID+Prefix+Generation+Engine)

---

## DPAY-14312: Config Studio | MVP4 | Preview API & UI‑Backend Consistency

**Status:** Dev in Progress  
**Assignee:** Sanchez, Ricardo  
**Priority:** 2 - High  
**Created:** February 10, 2026

### Description
Expose `/preview` and `/generate` endpoints using the same engine and logic to ensure that preview and final generation are consistent. Preview computes the next sequence without consuming it; final generation assigns a unique number atomically.

### Acceptance Criteria

**AC4 – Preview Non‑Consumption**
- Given a preview request for a prefix
- When the preview is generated
- Then it shows the next number (current+1) and does not increment the counter.

**AC5 – UI‑Backend Consistency**
- Given a user previews and then generates with the same inputs
- When final generation occurs
- Then the prefix logic is identical; the final ID may differ only if other requests consumed the sequence meanwhile.

**Single Source of Truth**
- Given any Client ID generation request (preview or final)
- When processed
- Then the backend engine is the only path; no client‑side generation is permitted.

**OpenAPI Contract**
- Given service consumers (UI/API)
- When integrating
- Then a published OpenAPI spec exists for `/preview` and `/generate` with required/optional inputs and error models.

**Documentation:** [Client ID Prefix Generation Engine](https://confluence.disney.com/spaces/Payments/pages/2042674133/Story+2.8+%E2%80%94+Client+ID+Prefix+Generation+Engine)

---

## DPAY-14313: Config Studio | MVP4 | Validation, Errors & Backward Compatibility

**Status:** Dev in Progress  
**Assignee:** Sanchez, Ricardo  
**Priority:** 2 - High  
**Created:** February 10, 2026

### Description
Implement validation and clear error handling for required inputs and invalid values; support legacy/manual IDs (no generation) and provide prefix extraction utility for downstream locking and validation.

### Acceptance Criteria

**AC1 – Missing SOR**
- Given a request without SOR
- When processed
- Then it is rejected with a clear message (e.g., `"sorCode is required"`) and no ID is generated.

**AC2 – Missing Site**
- Given a request without Site
- When processed
- Then it is rejected with a clear message (e.g., `"siteCode is required"`) and no ID is generated.

**AC3 – SOR Fallback Warning**
- Given an unmapped SOR code
- When resolved
- Then fallback uses the SOR code as acronym and logs a warning for governance review.

**AC4 – Prefix Extraction**
- Given a canonical Client ID (e.g., `ABD-WDW-ECOM-GST-0001`)
- When prefix is requested
- Then the function returns `ABD-WDW-ECOM-GST` (sequence excluded) and handles malformed inputs gracefully.

**AC5 – Backward Compatibility**
- Given a manually provided (legacy) Client ID
- When staging the client
- Then the ID is accepted without generation, and prefix extraction is available for locking elsewhere.

**Documentation:** [Client ID Prefix Generation Engine](https://confluence.disney.com/spaces/Payments/pages/2042674133/Story+2.8+%E2%80%94+Client+ID+Prefix+Generation+Engine)
