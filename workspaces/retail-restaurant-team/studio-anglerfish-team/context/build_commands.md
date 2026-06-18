# Build Commands — Studio Anglerfish (iOS)

## Prerequisites

- Xcode 15+ (latest stable recommended)
- Swift 5.9+
- swift-format (included with Xcode, run via `xcrun swift-format`)
- VPN or DGN (required for github.disney.com access)
- Valid Apple Developer account (for signing)

## Resolve Dependencies

Resolve package dependencies **only** when setting up the project for the first time or after switching branches:

```bash
xcodebuild -resolvePackageDependencies -onlyUsePackageVersionsFromResolvedFile -project <PROJECT>.xcodeproj
```

This uses the locked versions from `Package.resolved`. No need to run before every build.

## Build & Test (CI Commands)

### wdpr-dine-opp

```bash
# Resolve dependencies
xcodebuild -resolvePackageDependencies -onlyUsePackageVersionsFromResolvedFile -project WDPRDineOPP.xcodeproj

# Build + test
xcodebuild clean test -project WDPRDineOPP.xcodeproj -scheme WDPRDineOPP -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'
```

### wdpr-dine-checkin

```bash
xcodebuild -resolvePackageDependencies -onlyUsePackageVersionsFromResolvedFile -project WDPRDineCheckin.xcodeproj

xcodebuild clean test -project WDPRDineCheckin.xcodeproj -scheme WDPRDineCheckin -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'
```

### Scan-and-Go

```bash
xcodebuild -resolvePackageDependencies -onlyUsePackageVersionsFromResolvedFile -project ScanAndGo.xcodeproj

xcodebuild clean test -project ScanAndGo.xcodeproj -scheme ScanAndGo -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'
```

### fnb-shared

```bash
xcodebuild -resolvePackageDependencies -onlyUsePackageVersionsFromResolvedFile -project FNBShared.xcodeproj

xcodebuild clean test -project FNBShared.xcodeproj -scheme FNBShared -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'
```

### Running a specific test class

```bash
xcodebuild test \
  -project <PROJECT>.xcodeproj \
  -scheme <SCHEME> \
  \
  -only-testing:<TARGET>/<TestClass>
```

## Formatting

```bash
# Check formatting (CI)
xcrun swift-format lint --recursive Sources/ Tests/

# Auto-fix formatting
xcrun swift-format format --recursive --in-place Sources/ Tests/
```

## Static Analysis

```bash
# Xcode static analyzer
xcodebuild analyze \
  -project MyApp.xcodeproj \
  -scheme MyApp \
  -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest' \
  | xcpretty
```

## Archive & Distribution

```bash
# Archive for distribution
xcodebuild archive \
  -project <PROJECT>.xcodeproj \
  -scheme <SCHEME> \
  -archivePath build/<SCHEME>.xcarchive \
  -configuration Release

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/<SCHEME>.xcarchive \
  -exportPath build/ \
  -exportOptionsPlist ExportOptions.plist
```

## Common Issues

| Issue                     | Cause                           | Solution                                                  |
|---------------------------|---------------------------------|-----------------------------------------------------------|
| SPM resolution fails      | github.disney.com SSH key issue | Verify SSH key in GitHub settings                         |
| Signing errors            | Missing provisioning profile    | Update profiles in Xcode → Preferences → Accounts         |
| Build fails on M1/M2      | Architecture mismatch           | Set `EXCLUDED_ARCHS=arm64` for simulator builds if needed |
| Package.resolved conflict | Merge conflict in lockfile      | `swift package resolve` after resolving the JSON          |
