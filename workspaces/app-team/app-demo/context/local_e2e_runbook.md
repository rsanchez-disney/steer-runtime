# Local E2E Stack Runbook

Executable steps to run the full payment demo stack locally with Android emulator.

## Quick Start (All Services + Android)

```bash
# 1. Start infrastructure (MariaDB, Redis, LocalStack, Config Services)
cd ~/Workspace/Disney/DisneyPaymentsOrg/wdpr-config-services && docker-compose up -d

# 2. Start backend services
cd ~/Workspace/Disney/DisneyPaymentsOrg/wdpr-payment-demo-api && npm install && node server.js &
cd ~/Workspace/Disney/DisneyPaymentsOrg/wdpr-payment-sheet-api && npm install && npm start &

# 2. Build Android APK
cd ~/Workspace/Disney/DisneyPaymentsOrg/dpay-android-ui
export NEXUS_USER=<user>
export NEXUS_PASS=<pass>
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home
./gradlew assembleDebug

# 3. Start emulator + install
~/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36 &
~/Library/Android/sdk/platform-tools/adb wait-for-device
~/Library/Android/sdk/platform-tools/adb install -r app/build/outputs/apk/debug/app-debug.apk

# 4. Launch app
~/Library/Android/sdk/platform-tools/adb shell am start -n com.disney.mobilesdk/.MainActivity
```

## Service Startup Order

Services must start in this order (downstream first):

```
1. Docker (wdpr-config-services) → docker-compose up -d (MariaDB, Redis, LocalStack, Config Svc)
2. Payment Sheet API (:3000)     → npm start
3. Demo API (:8628)              → node server.js
4. Android Emulator              → emulator -avd <name>
5. Install + Launch APK          → adb install + adb shell am start
```

## Docker Compose (wdpr-config-services)

The main docker-compose lives in `wdpr-config-services` and provides the shared infrastructure:

| Service | Purpose |
|---------|---------|
| mariadb | Database (Aurora equivalent) |
| redis | Cache (ElastiCache equivalent) |
| localstack | AWS services (DynamoDB, S3) |
| nginx | Reverse proxy |
| c1 | Config Services app |
| adminer | DB admin UI |
| dynamo-admin | DynamoDB admin UI |

```bash
cd ~/Workspace/Disney/DisneyPaymentsOrg/wdpr-config-services
docker-compose up -d
# Verify: curl http://localhost:8080/actuator/health
```

This must start FIRST — other services depend on MariaDB and Redis.

## Android Emulator

### Available AVDs
```bash
~/Library/Android/sdk/emulator/emulator -list-avds
```

### Start Emulator
```bash
~/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36 -no-snapshot-load &
```

### Network: Emulator → Host Machine
- `10.0.2.2` maps to host `localhost` from inside the emulator
- Android app must use `10.0.2.2:8628` to reach Demo API on host

### ADB Commands
```bash
ADB=~/Library/Android/sdk/platform-tools/adb

# Wait for emulator to boot
$ADB wait-for-device
$ADB shell getprop sys.boot_completed  # returns "1" when ready

# Install APK
$ADB install -r app/build/outputs/apk/debug/app-debug.apk

# Launch app
$ADB shell am start -n com.disney.mobilesdk/.MainActivity

# View logs
$ADB logcat -s "DPAY" "AuthzInterceptor" "EstablishSession"

# Uninstall
$ADB uninstall com.disney.mobilesdk
```

## Pointing Android at Local Backend

Edit `PaymentAppConstants.java` before building:
```java
// For local testing via emulator:
public static final String HOST = "10.0.2.2";
public static final int PORT = 8628;
public static final boolean USE_HTTPS = false;
```

Or use the deployed `latest` environment (no changes needed — default config).

## Health Checks

After starting all services, verify:

```bash
curl -s http://localhost:8080/actuator/health | jq .status  # Session: "UP"
curl -s http://localhost:3000/health                         # Sheet API
curl -s http://localhost:8628/health                         # Demo API
```

## Teardown

```bash
# Stop background Node processes
pkill -f "node server.js"
pkill -f "npm start"

# Stop Docker
cd ~/Workspace/Disney/DisneyPaymentsOrg/wdpr-config-services && docker-compose down

# Stop emulator
~/Library/Android/sdk/platform-tools/adb emu kill
```
