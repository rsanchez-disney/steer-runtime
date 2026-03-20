# Android Platform Channels

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

### Android Side (Kotlin)
```kotlin
class BiometricPlugin : FlutterPlugin, MethodCallHandler {
    private lateinit var channel: MethodChannel
    
    override fun onAttachedToEngine(binding: FlutterPluginBinding) {
        channel = MethodChannel(binding.binaryMessenger, "com.example/biometric")
        channel.setMethodCallHandler(this)
    }
    
    override fun onMethodCall(call: MethodCall, result: Result) {
        when (call.method) {
            "authenticate" -> {
                authenticateUser(result)
            }
            else -> result.notImplemented()
        }
    }
    
    private fun authenticateUser(result: Result) {
        // Implementation
        result.success(true)
    }
    
    override fun onDetachedFromEngine(binding: FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
    }
}
```

### Register in MainActivity
```kotlin
class MainActivity: FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        flutterEngine.plugins.add(BiometricPlugin())
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

### Android Side
```kotlin
class LocationPlugin : FlutterPlugin, EventChannel.StreamHandler {
    private lateinit var eventChannel: EventChannel
    private var eventSink: EventSink? = null
    
    override fun onAttachedToEngine(binding: FlutterPluginBinding) {
        eventChannel = EventChannel(binding.binaryMessenger, "com.example/location")
        eventChannel.setStreamHandler(this)
    }
    
    override fun onListen(arguments: Any?, events: EventSink?) {
        eventSink = events
        startLocationUpdates()
    }
    
    override fun onCancel(arguments: Any?) {
        eventSink = null
        stopLocationUpdates()
    }
    
    private fun onLocationUpdate(lat: Double, lng: Double) {
        eventSink?.success(mapOf("lat" to lat, "lng" to lng))
    }
}
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

### Android Side
```kotlin
override fun onMethodCall(call: MethodCall, result: Result) {
    when (call.method) {
        "processData" -> {
            val name = call.argument<String>("name")
            val age = call.argument<Int>("age")
            val items = call.argument<List<String>>("items")
            
            // Process data
            result.success(mapOf("status" to "success"))
        }
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

### Android Side
```kotlin
override fun onMethodCall(call: MethodCall, result: Result) {
    try {
        // Operation
        result.success(data)
    } catch (e: Exception) {
        result.error("ERROR_CODE", e.message, null)
    }
}
```

## Best Practices

1. **Use consistent channel names**
   - Format: `com.company.app/feature`
   - Document in shared location

2. **Match method signatures**
   - Same method names on both sides
   - Same parameter types
   - Same return types

3. **Handle errors properly**
   - Use PlatformException on Flutter side
   - Use result.error on Android side
   - Provide meaningful error codes

4. **Clean up resources**
   - Unregister handlers in onDetachedFromEngine
   - Cancel streams in onCancel
   - Release native resources

5. **Test thoroughly**
   - Test on multiple Android versions
   - Test error cases
   - Test with missing permissions
