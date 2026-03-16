# Implementation Validation Prompt

Review the codebase to validate if the following JIRA stories have been fully implemented and all acceptance criteria are covered:

## DPAY-14310: Deterministic Prefix Builder & Canonical Format

Verify the implementation includes:
- [ ] Canonical format: `{ACRONYM}-{SITE}-{SEQUENCE}` with single dashes and 4-digit zero-padded sequence
- [ ] Optional fields format: `{ACRONYM}-{SITE}-<optional fields>-{SEQUENCE}` with no empty dashes
- [ ] SOR code to acronym resolution with fallback to SOR code + warning when mapping is missing
- [ ] Optional fields in fixed order, conditional fields in alphabetical order by key
- [ ] Empty/null values excluded from prefix construction

## DPAY-14311: Atomic Sequence Generation & Uniqueness

Verify the implementation includes:
- [ ] Unique sequence numbers per prefix (no duplicates)
- [ ] Thread-safe, atomic sequence generation handling concurrent requests
- [ ] Zero-padded 4-digit sequence formatting (e.g., `0010`, `0100`)
- [ ] Database schema for `client_id_sequences` table
- [ ] Resilience: no duplicate numbers on retry (gaps acceptable)

## DPAY-14312: Preview API & UI‑Backend Consistency

Verify the implementation includes:
- [ ] `/preview` endpoint that shows next sequence without incrementing counter
- [ ] `/generate` endpoint that atomically assigns unique sequence
- [ ] Both endpoints use the same prefix generation engine
- [ ] Preview and generate produce identical prefix logic with same inputs
- [ ] Backend is single source of truth (no client-side generation)
- [ ] OpenAPI spec published for both endpoints with required/optional inputs and error models

## DPAY-14313: Validation, Errors & Backward Compatibility

Verify the implementation includes:
- [ ] Validation rejecting requests without SOR with clear error message
- [ ] Validation rejecting requests without Site with clear error message
- [ ] SOR fallback warning logged when unmapped SOR code is used
- [ ] Prefix extraction function that returns prefix without sequence (e.g., `ABD-WDW-ECOM-GST` from `ABD-WDW-ECOM-GST-0001`)
- [ ] Prefix extraction handles malformed inputs gracefully
- [ ] Legacy/manual Client IDs accepted without generation
- [ ] Prefix extraction available for legacy IDs for downstream locking

## Validation Instructions

For each acceptance criterion:
1. Identify the relevant code files and functions
2. Verify the logic matches the acceptance criteria
3. Check for edge cases and error handling
4. Confirm test coverage exists (if applicable)
5. Note any gaps or incomplete implementations

Provide a summary report indicating:
- ✅ Fully implemented criteria
- ⚠️ Partially implemented criteria (with gaps)
- ❌ Missing implementations
- 📝 Additional notes or concerns
