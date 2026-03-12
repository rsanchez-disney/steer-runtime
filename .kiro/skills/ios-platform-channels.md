# iOS Platform Channels

## Method Channel (Most Common)

### Flutter Side
```dart
class BiometricAuth {
  static const platform = MethodChannel('com.example/biometric');
  
  Future<bool> authenticate() async {
    try {
      final result = await platform.invokeMethod('authenticate');
      return result as bool;
    } catch (e) {
      return false;
    }
  }
}
```

### iOS Side (Swift)
```swift
@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let controller = window?.rootViewController as! FlutterViewController
        let channel = FlutterMethodChannel(
            name: "com.example/biometric",
            binaryMessenger: controller.binaryMessenger
        )
        
        channel.setMethodCallHandler { (call: FlutterMethodCall, result: @escaping FlutterResult) in
            switch call.method {
            case "authenticate":
                self.authenticateUser(result: result)
            default:
                result(FlutterMethodNotImplemented)
            }
        }
        
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
    
    private func authenticateUser(result: @escaping FlutterResult) {
        // Implementation using LocalAuthentication
        result(true)
    }
}
```

## Event Channel (Streaming Data)

### Flutter Side
```dart
class LocationService {
  static const stream = EventChannel('com.example/location');
  
  Stream<Map<String, double>> get locationStream {
    return stream.receiveBroadcastStream().map((event) {
      return Map<String, double>.from(event);
    });
  }
}
```

### iOS Side
```swift
class LocationStreamHandler: NSObject, FlutterStreamHandler {
    private var eventSink: FlutterEventSink?
    
    func onListen(withArguments arguments: Any?, eventSink events: @escaping FlutterEventSink) -> FlutterError? {
        self.eventSink = events
        startLocationUpdates()
        return nil
    }
    
    func onCancel(withArguments arguments: Any?) -> FlutterError? {
        self.eventSink = nil
        stopLocationUpdates()
        return nil
    }
    
    private func onLocationUpdate(lat: Double, lng: Double) {
        eventSink?(["lat": lat, "lng": lng])
    }
}

// In AppDelegate
let eventChannel = FlutterEventChannel(
    name: "com.example/location",
    binaryMessenger: controller.binaryMessenger
)
eventChannel.setStreamHandler(LocationStreamHandler())
```

## Passing Complex Data

### Flutter Side
```dart
final result = await platform.invokeMethod('processData', {
  'name': 'John',
  'age': 30,
  'items': ['a', 'b', 'c']
});
```

### iOS Side
```swift
channel.setMethodCallHandler { (call: FlutterMethodCall, result: @escaping FlutterResult) in
    switch call.method {
    case "processData":
        if let args = call.arguments as? [String: Any],
           let name = args["name"] as? String,
           let age = args["age"] as? Int,
           let items = args["items"] as? [String] {
            // Process data
            result(["status": "success"])
        } else {
            result(FlutterError(code: "INVALID_ARGS", message: "Invalid arguments", details: nil))
        }
    default:
        result(FlutterMethodNotImplemented)
    }
}
```

## Error Handling

### Flutter Side
```dart
try {
  final result = await platform.invokeMethod('riskyOperation');
} on PlatformException catch (e) {
  print('Error: ${e.code} - ${e.message}');
}
```

### iOS Side
```swift
channel.setMethodCallHandler { (call: FlutterMethodCall, result: @escaping FlutterResult) in
    do {
        // Operation
        result(data)
    } catch {
        result(FlutterError(
            code: "ERROR_CODE",
            message: error.localizedDescription,
            details: nil
        ))
    }
}
```

## Async Operations

### Using Completion Handlers
```swift
private func fetchData(result: @escaping FlutterResult) {
    apiClient.fetch { data, error in
        if let error = error {
            result(FlutterError(code: "FETCH_ERROR", message: error.localizedDescription, details: nil))
        } else {
            result(data)
        }
    }
}
```

### Using async/await (iOS 13+)
```swift
private func fetchData(result: @escaping FlutterResult) {
    Task {
        do {
            let data = try await apiClient.fetch()
            result(data)
        } catch {
            result(FlutterError(code: "FETCH_ERROR", message: error.localizedDescription, details: nil))
        }
    }
}
```

## Best Practices

1. **Use consistent channel names**
   - Format: `com.company.app/feature`
   - Match Android channel names exactly

2. **Match method signatures**
   - Same method names as Android
   - Same parameter types
   - Same return types

3. **Handle errors properly**
   - Use FlutterError for errors
   - Provide meaningful error codes
   - Include error details

4. **Clean up resources**
   - Release references when done
   - Cancel streams properly
   - Handle app lifecycle

5. **Test thoroughly**
   - Test on multiple iOS versions
   - Test error cases
   - Test with missing permissions

## Info.plist Permissions

Common permissions needed:
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan QR codes</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>We need location to show nearby stores</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo access to upload images</string>

<key>NSMicrophoneUsageDescription</key>
<string>We need microphone for voice calls</string>

<key>NSFaceIDUsageDescription</key>
<string>We use Face ID for secure authentication</string>
```
