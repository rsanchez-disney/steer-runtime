# Passport Phase 2 — Team Context

## Project
- **Jira Project:** PAS2
- **Epic:** PAS2-1 — Photo Upload, Management, and Display
- **Domain:** DLR | TnP | Flutter | Photo Display
- **Label:** PAS2_CQE

## Tech Stack
- **Mobile App:** Flutter (cross-platform iOS + Android)
- **Platform:** Park apps monorepo (`dx-park-apps/park-apps-monorepo`)
- **Test Management:** XRay (Cucumber/Gherkin in Jira)
- **Test Execution:** Appium 2.x via appium-mcp

## Appium Configuration

### iOS
```json
{
  "platformName": "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": "iPhone 15",
  "appium:bundleId": "com.disney.wdpro.dlr",
  "appium:noReset": true
}
```

### Android
```json
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:appPackage": "com.disney.wdpro.dlr",
  "appium:appActivity": "com.disney.wdpro.dlr.MainActivity",
  "appium:noReset": true
}
```

## Test Repository Paths
- Mobile/Flutter stories: `/Passport - UI`
- Services/BE stories: `/Passport - BE`

## Active Test Cases (Pilot)
- PAS2-649: Photo display based on photo state (Scenario Outline, 4 iterations)
- PAS2-646: No photo when feature OFF
- PAS2-703: CTA state based on conditions (Scenario Outline, 4 iterations)
- PAS2-706: Tapping CTA navigates to upload flow
- PAS2-707: CTA text loaded from CMS
