---
name: clear-gradle-cache
description: Remove Gradle cached artifacts for a specific library. Since sometimes caches is kept for some libraries. This happens when there is an update in some library but the version number is not updated, so gradle thinks that the cached version is up to date and doesn't fetch the new version. This skill helps to clear the cache for a specific library to make sure that the new version is fetched and used in the build.
triggers:
  - clear cache
  - clean cache
  - remove cache
  - gradle cache
---

# Clear Gradle Cache for a Library

## Parameters
- **library_name**: The name of the library to remove from Gradle caches.

## Steps

1. Ask the user for the library name if not provided.

2. Execute:
   ```bash
   find ~/.gradle/caches/ -type d -name "<library_name>" -prune -exec rm -rf "{}" \; -print
   ```

3. Report which directories were removed (the `-print` flag outputs them).
