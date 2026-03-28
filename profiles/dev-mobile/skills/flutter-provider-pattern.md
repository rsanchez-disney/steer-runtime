# Flutter Provider Pattern Implementation

## When to Use

Use Provider for:
- Dependency injection
- State management
- Sharing data across widget tree
- Reactive UI updates

## Provider Types

### Provider (Immutable)
```dart
Provider<ApiClient>(
  create: (_) => ApiClient(),
  child: MyApp(),
)
```

### ChangeNotifierProvider (Mutable State)
```dart
ChangeNotifierProvider(
  create: (_) => CartModel(),
  child: MyApp(),
)

class CartModel extends ChangeNotifier {
  final List<Item> _items = [];
  
  void add(Item item) {
    _items.add(item);
    notifyListeners();
  }
}
```

### FutureProvider (Async Init)
```dart
FutureProvider<Config>(
  create: (_) => fetchConfig(),
  initialData: Config.empty(),
  child: MyApp(),
)
```

### StreamProvider (Real-time Data)
```dart
StreamProvider<User>(
  create: (_) => authStream(),
  initialData: User.guest(),
  child: MyApp(),
)
```

## Consuming Providers

### context.watch (Rebuilds on Change)
```dart
Widget build(BuildContext context) {
  final cart = context.watch<CartModel>();
  return Text('Items: ${cart.items.length}');
}
```

### context.read (No Rebuild)
```dart
onPressed: () {
  context.read<CartModel>().add(item);
}
```

### Consumer (Granular Rebuild)
```dart
Consumer<CartModel>(
  builder: (context, cart, child) {
    return Text('Items: ${cart.items.length}');
  },
)
```

### Selector (Optimized Rebuild)
```dart
Selector<CartModel, int>(
  selector: (_, cart) => cart.items.length,
  builder: (_, count, __) {
    return Text('Items: $count');
  },
)
```

## MultiProvider Pattern

```dart
MultiProvider(
  providers: [
    Provider<ApiClient>(create: (_) => ApiClient()),
    ChangeNotifierProvider(create: (_) => AuthModel()),
    ChangeNotifierProvider(create: (_) => CartModel()),
  ],
  child: MyApp(),
)
```

## ProxyProvider (Dependencies)

```dart
MultiProvider(
  providers: [
    Provider<ApiClient>(create: (_) => ApiClient()),
    ProxyProvider<ApiClient, UserRepository>(
      update: (_, api, __) => UserRepository(api),
    ),
  ],
  child: MyApp(),
)
```

## Testing with Provider

```dart
testWidgets('cart updates', (tester) async {
  final cart = CartModel();
  
  await tester.pumpWidget(
    ChangeNotifierProvider.value(
      value: cart,
      child: MyApp(),
    ),
  );
  
  cart.add(Item('test'));
  await tester.pump();
  
  expect(find.text('Items: 1'), findsOneWidget);
});
```

## Best Practices

1. **Scope providers appropriately**
   - Global: App-level state (auth, theme)
   - Feature: Feature-level state (form, list)

2. **Dispose resources**
   ```dart
   @override
   void dispose() {
     _controller.dispose();
     super.dispose();
   }
   ```

3. **Avoid Provider.of in build**
   - Use context.watch instead
   - Provider.of doesn't support null safety well

4. **Use Selector for performance**
   - Only rebuild when specific data changes
   - Reduces unnecessary rebuilds

5. **Keep ChangeNotifier simple**
   - Single responsibility
   - Clear API
   - Minimal logic in notifyListeners

## Common Patterns

### Loading State
```dart
class DataModel extends ChangeNotifier {
  bool _isLoading = false;
  bool get isLoading => _isLoading;
  
  Future<void> load() async {
    _isLoading = true;
    notifyListeners();
    
    await fetchData();
    
    _isLoading = false;
    notifyListeners();
  }
}
```

### Error Handling
```dart
class DataModel extends ChangeNotifier {
  String? _error;
  String? get error => _error;
  
  Future<void> load() async {
    try {
      await fetchData();
      _error = null;
    } catch (e) {
      _error = e.toString();
    }
    notifyListeners();
  }
}
```

### Form State
```dart
class FormModel extends ChangeNotifier {
  String _name = '';
  String get name => _name;
  
  void updateName(String value) {
    _name = value;
    notifyListeners();
  }
  
  bool get isValid => _name.isNotEmpty;
}
```
