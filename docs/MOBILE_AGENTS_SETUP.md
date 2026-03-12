# Mobile Development Agents - Setup Complete

Three specialized agents for Flutter and native mobile development have been created.

## Created Agents

### 1. Flutter Agent
**Location:** `.kiro/mobile/flutter/`

**Capabilities:**
- Dart/Flutter development
- Widget composition and UI
- State management (Provider, Riverpod, Bloc)
- Monorepo package management
- Platform channel interfaces (Flutter side)
- Testing (unit, widget, integration)

**Configuration:** `flutter.json`
- Tools: read, write, shell
- Allowed paths: lib/**, packages/**, test/**, pubspec.yaml

**Skills:**
- `flutter-provider-pattern.md` - Provider state management
- `flutter-monorepo-packages.md` - Package organization

**Steering:**
- `20-repo-flutter-monorepo.md` - Repository structure

---

### 2. Android Native Agent
**Location:** `.kiro/mobile/android_native/`

**Capabilities:**
- Kotlin/Java development
- Platform channels (Android side)
- Native Android features and APIs
- Gradle configuration
- Android permissions and manifest
- Native module integration

**Configuration:** `android_native.json`
- Tools: read, write, shell
- Allowed paths: android/**, build.gradle, AndroidManifest.xml

**Skills:**
- `android-platform-channels.md` - Platform channel implementation

---

### 3. iOS Native Agent
**Location:** `.kiro/mobile/ios_native/`

**Capabilities:**
- Swift/Objective-C development
- Platform channels (iOS side)
- Native iOS features and APIs
- CocoaPods/SPM configuration
- iOS permissions and Info.plist
- Native module integration

**Configuration:** `ios_native.json`
- Tools: read, write, shell
- Allowed paths: ios/**, Podfile, Info.plist

**Skills:**
- `ios-platform-channels.md` - Platform channel implementation

---

## Orchestrator Integration

**Added:** `.kiro/shared/.kiro/steering/60-mobile-coordination.md`

Defines coordination patterns:
- Flutter-only features
- Cross-platform native features
- Platform-specific features
- Platform channel contract validation

---

## Usage Examples

### Flutter-Only Feature
```
Prompt to Orchestrator:
"Add a payment form with validation using Provider for state management"

Orchestrator delegates to Flutter Agent:
- Create form widget
- Add validation logic
- Implement Provider
- Add tests
```

### Cross-Platform Native Feature
```
Prompt to Orchestrator:
"Add biometric authentication to the app"

Orchestrator coordinates:
1. Flutter Agent: Create BiometricAuth interface + MethodChannel
2. Android Native Agent: Implement BiometricPrompt
3. iOS Native Agent: Implement LocalAuthentication
4. Validate: Contracts match across platforms
```

### Platform-Specific Feature
```
Prompt to Android Native Agent:
"Add Android home screen widget for quick actions"

Android Native Agent:
- Implement widget
- Configure manifest
- Document usage
```

---

## Key Features

### Provider Pattern Support
Flutter agent understands:
- ChangeNotifierProvider for mutable state
- Provider for immutable dependencies
- FutureProvider for async initialization
- StreamProvider for real-time data
- MultiProvider and ProxyProvider patterns

### Monorepo Support
Flutter agent handles:
- Package organization (core, ui_components, features)
- Dependency management
- Path dependencies
- Package exports and imports

### Platform Channels
All agents coordinate on:
- Method channel implementation
- Event channel for streaming
- Contract validation
- Error handling
- Type compatibility

---

## File Structure

```
.kiro/mobile/
├── AGENTS.md                           # Overview of mobile agents
├── flutter/
│   └── .kiro/
│       ├── agents/flutter.json         # Agent config
│       ├── prompts/flutter.md          # Agent instructions
│       ├── skills/
│       │   ├── flutter-provider-pattern.md
│       │   └── flutter-monorepo-packages.md
│       └── steering/
│           └── 20-repo-flutter-monorepo.md
├── android_native/
│   └── .kiro/
│       ├── agents/android_native.json
│       ├── prompts/android_native.md
│       └── skills/
│           └── android-platform-channels.md
└── ios_native/
    └── .kiro/
        ├── agents/ios_native.json
        ├── prompts/ios_native.md
        └── skills/
            └── ios-platform-channels.md
```

---

## Next Steps

1. **Test the agents** with your Flutter project
2. **Add project-specific skills** as needed
3. **Customize steering documents** for your architecture
4. **Add more skills** for specific patterns (navigation, API clients, etc.)

---

## Integration with Existing Agents

The mobile agents complement your existing agents:

```
orchestrator
├── backend (Java services)
├── webapi (Node.js API)
├── ui (Angular)
└── mobile
    ├── flutter (Dart/Flutter)
    ├── android_native (Kotlin/Java)
    └── ios_native (Swift/Obj-C)
```

All agents coordinate through the orchestrator for cross-platform features.

---

**Status:** ✅ Ready to use
**Created:** March 11, 2026
**Agents:** 3 (flutter, android_native, ios_native)
**Skills:** 4 documents
**Steering:** 2 documents
