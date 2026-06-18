# iOS Agent Pre-Build Rules

## MANDATORY: Run these steps before building with xcodebuild

Before running `xcodebuild` (build or test), ALWAYS run the applicable steps first.

### wdpr-dine-opp and wdpr-dine-checkin

1. **swift-format** — format all changed files:
   ```bash
   xcrun swift-format format --in-place <changed-files>
   ```

2. **Mock generation** — if any protocol with `AutoMockable` was added or modified:
   ```bash
   swiftiermocky generate
   ```

3. **Schema code generation** — if any JSON schema was added or modified:
   - wdpr-dine-opp: `./mobile-order-service-call-schemas/scripts/generate-classes.swift ios swift ./mobile-order-service-call-schemas ./WDPRDineOPP/Core/Services/Generated`
   - wdpr-dine-checkin: `./dine-checkin-service-call-schemas/scripts/generate-classes.swift ios swift ./dine-checkin-service-call-schemas ./WDPRDineCheckin/Core/Services/Generated`

### Scan-and-Go and fnb-shared

1. **swift-format** — format all changed files:
   ```bash
   xcrun swift-format format --in-place <changed-files>
   ```

## Mock Library

This team uses **SwiftierMocky** (NOT SwiftyMocky):
- Binary: `swiftiermocky` (lowercase, one word)
- Location: `~/.studio-anglerfish/bin/swiftiermocky`
- API is the same as SwiftyMocky (`Given`, `Verify`, `Perform`)
- Configuration: `Mockfile` at repo root
- NEVER run `swift package` commands to install or run SwiftyMocky
