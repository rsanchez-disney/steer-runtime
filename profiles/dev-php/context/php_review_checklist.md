# PHP Code Review Checklist

When reviewing PHP code, check for these common issues:

## Memory & Performance
- Circular references between objects that prevent garbage collection
- Memory leaks from large data structures not being freed
- Deprecated functions that will break on PHP version upgrades

## Type Safety
- Type juggling issues — loose comparisons (`==`) between strings and integers producing unexpected results; prefer strict comparisons (`===`)
- Undefined variables — uninitialized variables causing notices and subtle bugs
- Incorrect use of references — unexpected behavior when passing or returning by reference

## Logic & Control Flow
- Off-by-one errors in loops and array indexing
- Logic errors — code runs without errors but produces wrong results
- Inconsistent data states from multiple code paths modifying shared data without synchronization

## Error Handling
- Silent failures from uncaught exceptions or missing error logging
- Improper error handling that swallows exceptions without logging

## Security
- SQL injection — user input not sanitized; must use parameterized queries or prepared statements
- Session fixation or improper session expiration
- Configuration issues in php.ini that affect security (e.g., display_errors in production)

## Concurrency & State
- Race conditions when accessing shared resources (databases, files)
- Inconsistent data states from concurrent modifications without locking

## Dependencies
- Incompatible third-party library versions
- Using deprecated functions or APIs scheduled for removal
