# Mobile Development Coordination

## Agent Responsibilities

### Flutter Agent
- Dart/Flutter code
- Widget development
- State management (Provider)
- Platform channel interfaces
- Monorepo packages

### Android Native Agent
- Kotlin/Java code
- Platform channels (Android side)
- Native Android features
- Gradle configuration

### iOS Native Agent
- Swift/Objective-C code
- Platform channels (iOS side)
- Native iOS features
- CocoaPods configuration

## Coordination Patterns

### Pattern 1: Flutter-Only Feature
```
User: Add payment form with validation

Orchestrator → Flutter Agent:
- Create form widget
- Add validation logic
- Implement Provider for state
- Add tests
```

### Pattern 2: Cross-Platform Native Feature
```
User: Add biometric authentication

Orchestrator:
1. Flutter Agent: Create BiometricAuth interface + MethodChannel
2. Android Native Agent: Implement BiometricPrompt
3. iOS Native Agent: Implement LocalAuthentication
4. Validate: Method names and types match across platforms
```

### Pattern 3: Platform-Specific Feature
```
User: Add Android home screen widget

Orchestrator → Android Native Agent:
- Implement widget
- Configure manifest
- Document usage
```

## Platform Channel Contract Validation

When coordinating platform channels:

1. **Method names must match exactly**
   - Flutter: `authenticate()`
   - Android: `"authenticate"`
   - iOS: `"authenticate"`

2. **Parameter types must be compatible**
   - Flutter: `Map<String, dynamic>`
   - Android: `Map<String, Any>`
   - iOS: `[String: Any]`

3. **Return types must match**
   - Document expected return type
   - Handle null/optional properly
   - Error codes consistent

4. **Error handling must align**
   - Same error codes across platforms
   - Same error message format
   - Proper PlatformException usage

## Delegation Rules

### Delegate to Flutter Agent when:
- Pure Dart/Flutter code
- UI components
- State management
- Business logic
- No native APIs needed

### Delegate to Native Agents when:
- Platform-specific APIs
- Native module integration
- Performance-critical native code
- Platform channels implementation

### Coordinate Multiple Agents when:
- Feature spans Flutter + native
- Platform channels needed
- Cross-platform consistency required
- Contract validation needed

## Quality Checks

Before completing mobile features:

- [ ] Flutter code follows Dart style guide
- [ ] Native code follows platform conventions
- [ ] Platform channel contracts match
- [ ] Error handling consistent
- [ ] Tests written for all layers
- [ ] Documentation updated
- [ ] Tested on both platforms
- [ ] Backward compatibility maintained
