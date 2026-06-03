# CPC Capabilities Matrix

## What CPC Can Deliver

| Capability | Domains | Description |
|-----------|---------|-------------|
| Native mobile app development | Mobile Parks Apps, Shield | Full lifecycle iOS and Android development for park apps |
| Flutter cross-platform development | Mobile Parks Apps, GAC/Profile | Shared UI components and features across iOS/Android |
| Web component development | Web Global Components | Reusable navigation, search, and global UI components |
| Backend service development | Finders, GAC/Profile, Connected Products | Java/Spring Boot microservices and APIs |
| IoT integration | Connected Products | Hardware-software bridge for smart devices |
| App sustainment and crash management | Shield | Ongoing maintenance, crash triage, and hotfix delivery |
| Release management | Mobile Parks Apps, Shield | App Store/Play Store release coordination |
| Test automation | Mobile Parks Apps | End-to-end and regression test automation |
| Performance optimization | Web Global Components, Mobile Parks Apps | Core Web Vitals, app launch time, memory management |
| Accessibility compliance | Web Global Components, Mobile Parks Apps | WCAG 2.1 AA compliance |
| Localization | Mobile Parks Apps | Multi-language support (EN, ES, JA, KO, SC, TC) |

## What Each Domain Owns

### Mobile Parks Apps
- WDW (My Disney Experience), DLR (Disneyland), HKDL native apps
- iOS and Android platform-specific implementations
- Flutter shared modules
- App release lifecycle (build, test, stage, production)
- Crash monitoring and resolution
- Localization and accessibility

### Web Global Components
- Global navigation bar (all Disney web properties)
- Search autocomplete component
- OneID authentication UI integration
- Cart and checkout navigation support
- Salesforce web chat integration
- Cross-property component library

### Finders
- Guest Context Service (personalized content delivery)
- Discovery Service (TxP) — facility search and recommendations
- Explorer Service — resort data export
- Capella migration (search infrastructure)
- Map data and wayfinding backend

### GAC / Profile
- TXP Party Profile platform (R1.0, R1.1)
- GAM (Guest Account Management) services
- Profile Web (Angular) and Mobile (Android, Flutter)
- Guest identity and preference management
- Privacy and consent APIs

### Connected Products
- Big Belly Show Ready Integration (smart waste)
- TxP Native Wallet Web Integration (Apple/Google Pay)
- IoT device management and monitoring

### Shield
- Core app sustainment (DLR, WDW, HKDL)
- NewRelic crash triage and permanent fixes
- Security vulnerability remediation
- Third-party SDK version control
- Release management services

## What Each POD Specializes In

| POD | Domain | Specialization |
|-----|--------|---------------|
| Shield iOS | Shield | iOS crash fixes, sustainment, Flutter lifecycle |
| Shield Magios | Shield | Android crash fixes, sustainment |
| Mobile Parks Apps (iOS) | Mobile Parks Apps | Feature development, HKDL, backlog reduction |
| Mobile Parks Apps (Android) | Mobile Parks Apps | Feature development, localization |
| Web Global Comp | Web Global Components | Navigation, search, OneID, accessibility |
| Finders | Finders | Guest Context, Discovery, Explorer services |
| Profile Web | GAC/Profile | Angular web profile, TXP Party UI |
| Profile Services | GAC/Profile | Java backend, GAM, identity APIs |
| Profile Mobile | GAC/Profile | Flutter/Android profile features |
| Connected Products | Connected Products | Big Belly, Wallet, IoT |

## Cross-Team Dependencies

| From | To | Dependency |
|------|----|-----------|
| Mobile Parks Apps | Finders | Map data, facility search APIs |
| Mobile Parks Apps | GAC/Profile | Guest identity, profile data |
| Mobile Parks Apps | Web Global Components | Shared design tokens, component specs |
| Web Global Components | GAC/Profile | OneID authentication flow |
| Finders | Connected Products | Explorer Service data for IoT |
| Shield | Mobile Parks Apps | Crash fixes merged into feature branches |
| All domains | Shield | Release management coordination |
