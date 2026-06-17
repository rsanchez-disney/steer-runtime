# Generate Android Park app builds locally

## Prerequisites

The environment variable `PARK_APPS_REPO` must point to the park apps monorepo root. Each developer sets this in their shell profile (e.g., `~/.zshrc`):

```bash
export PARK_APPS_REPO="$HOME/dev/park-apps-monorepo-android"
```

If `PARK_APPS_REPO` is not set, ask the user for the path before proceeding.

---

The current project is a library which is used by 2 main park apps. The project that uses this library is in `$PARK_APPS_REPO/android`. The 2 main park apps are `wdw` and `dlr`. The gradle files for these apps are located in `$PARK_APPS_REPO/android/apps/wdw/build.gradle.kts` and `$PARK_APPS_REPO/android/apps/dlr/build.gradle.kts` respectively.

To generate builds for the `wdw` and `dlr` park apps, you can follow these steps:

1. Looks for the file `gradle.properties` that contains the version of the library. This files generally contain a content like this: 
   ```
      group=com.disney.wdpro
      version=9.0.0-SNAPSHOT
   ```
   Check that version contains suffix "-LOCAL" at the end. If not, update the version to include the suffix "-LOCAL". This indicates that the library is a local version and should be used for development builds. Don't replace other suffixes like "-SNAPSHOT" or "-RELEASE", just add "-LOCAL" at the end of the version string.
2. Execute the Gradle task of the current library. The command looks like ":<library_name>:publishToMavenLocal" (e.g. ":scan-and-go-lib:publishToMavenLocal", ":opp-dine-ui-lib:publishToMavenLocal" or ":dinecheckin:publishToMavenLocal") for publishing the library to the local Maven repository. Mind the version of the library published it will be used afterwards.
3. Depending on the park app desired to build, modify the `build.gradle.kts` file of the app to use the local version of the library. For example, if you want to build the `wdw` app, update the dependency in `build.gradle.kts` to point to the local version of the library published in step 2. Also force the use of this specific version of the library in the `build.gradle.kts` file to ensure that the local version is used during the build process. This can be done by adding a resolution strategy in the dependencies block to force the use of the local version.
4. Build the desired park app using Gradle. For example, to build the `wdw` app, you can run the following command in the terminal:
   ```bash
   cd $PARK_APPS_REPO/android && ./gradlew :apps:wdw:assembleDebug
   ```
   This will generate a debug build of the `wdw` app that includes the local version of the library. After building the app please install it in the emulator/device that is currently running. You can do this by running:
   ```bash
   cd $PARK_APPS_REPO/android && ./gradlew :apps:wdw:installDebug
   ```
