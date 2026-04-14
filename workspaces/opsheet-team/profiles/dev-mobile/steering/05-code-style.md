---
inclusion: always
---

# Dart/Flutter Code Style

All generated Dart/Flutter code MUST follow the project code style guide. The full reference is at #[[file:code_style.md]].

## Quick Reference — Key Rules

### Ordering

1. **Imports**: grouped and alphabetical — `dart:` → `package:` → relative imports
2. **Class members**: Constructor → static vars → local vars → getters/setters → methods (static public → static private → public lifecycle → public non-lifecycle → private lifecycle → private non-lifecycle → private build → public build)
3. **Arguments/parameters**: alphabetical order, with `child`/`children` always last
4. **Constructor parameters**: alphabetical order, matching field declaration order

### Code Flow

- Single `return` per method (always the last statement)
- Only `throw` classes extending `Exception` or `Error`

### Style

- Trailing commas everywhere (except single-param non-wrapping calls)
- Prefer named parameters for constructors and methods with 3+ params
- Prefer single quotes (`'text'` not `"text"`)
- Prefer relative imports within the project

### Widget Arguments

`child`, `children` and `body` must always be the last argument:

```dart
Container(
  color: Colors.white,
  height: 200.0,
  width: 300.0,
  child: Text('Hello'),
)
```
