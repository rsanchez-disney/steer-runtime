# Studio Proteus — Team Context

## Studio

**Studio Proteus** is the Android mobile engineering studio within the DXT Mobile Retail & Restaurant Engineering team. It builds and maintains guest-facing Android libraries for Mobile Order, Merchandise Checkout, Dine Check-In, and shared FnB components used by the Disney park apps (WDW and DLR).

## Team Members

| Name | Role | Email |
|------|------|-------|
| Roberto Patoni | Tech Manager | roberto.patoni@disney.com |
| Luis Carino | Studio Lead | luis.carino@disney.com |
| Jorge E. Perez | Developer | jorge.e.perez.-nd@disney.com |
| Geovanny A. Buitrago | Developer | geovanny.a.buitrago.-nd@disney.com |
| Jose Aviles | Developer | Jose.Aviles@disney.com |
| Daniel Campoverde Carrion | Developer | Daniel.Campoverde.Carrion.-ND@disney.com |

## Distribution List

WDPR Technology Studio Proteus <WDPR.Technology.Studio.Proteus@disney.com>

## Slack Channels

| Channel | Purpose |
|---------|---------|
| `#studio-proteus` | Studio Proteus general |
| `#dine-mobile-tech-moo` | Mobile dine general discussion (cross-platform) |
| `#dine-mobile-private` | Private group for mobile dine tech and QA |
| `#android-components` | Android technical chat with all LOBs |

## GitHub Org

- https://github.disney.com/studio-proteus
- https://github.disney.com/park-platform-android (shared Android platform)

## Repositories

| Repo | Module | Purpose |
|------|--------|---------|
| opp-dine-ui-lib | `:opp-dine-ui` | Mobile Order UI — restaurant selection, menu, order flow |
| scan-and-go-lib | `:scan-and-go-lib` | Mobile Merchandise Checkout (Scan & Go) |
| dine-check-in-android | `:dinecheckin` | Dine Check-In and Walk-Up List |
| android-fnb-commons-lib | `:android-fnb-commons` | Shared FnB UI, utilities, analytics, location |

## Key Projects

- **Mobile Order (MDX)** — Order/Pay/Pickup flow for WDW and DLR park apps
- **Mobile Merchandise Checkout** — Scan & Go retail checkout
- **Dine Check-In** — Guest dining check-in and walk-up list
- **Dine Booking** — Dining reservation and modifications

## Jira

- Projects: `FNB-` (Food & Beverage), `MERCH-` (Merchandise)
- Instance: disneyexperiences.atlassian.net
- Commit style: Conventional commits
- Branch naming: `{type}/{ticket-id}/description`

## Build Environment

All repos are Android libraries using Gradle with Kotlin DSL. Libraries are consumed by the Disney park apps monorepo (`park-apps-monorepo-android`). Local development builds are published via `./gradlew :<module>:publishToMavenLocal`.

- Dependency catalog: `com.disney.wdpro:catalog-disney:9.0.0-SNAPSHOT`
- Group: `com.disney.wdpro`
- Testing: JUnit 4 + MockK, Coroutines Test, Turbine

## Available Skills

| Skill | Triggers | Description | File |
|-------|----------|-------------|------|
| Mergeback PR | `mergeback`, `MB`, `merge back` | Performs a mergeback PR that merges changes from an older release branch into a newer one, handling conflicts and creating the PR with the correct naming convention. | [`../profiles/dev-mobile/skills/mergeback_workflow_skill.md`](../profiles/dev-mobile/skills/mergeback_workflow_skill.md) |
| Get DDP User | `DDP user`, `DDP credentials`, `dining plan user`, `get DDP` | Fetches fresh Disney Dining Plan test user credentials (email, password, reservationId) from the internal test API. | [`../profiles/dev-mobile/skills/get_ddp_user.md`](../profiles/dev-mobile/skills/get_ddp_user.md) |
| Create Park App Build | *(invoke by description)* | Publishes the current library to local Maven and builds/installs a WDW or DLR park app debug build using that local version. | [`../profiles/dev-mobile/skills/create_park_app_build.md`](../profiles/dev-mobile/skills/create_park_app_build.md) |
| Clear Gradle Cache | `clear cache`, `clean cache`, `remove cache`, `gradle cache` | Removes Gradle cached artifacts for a specific library to force re-fetching when a version update isn't being picked up. | [`../profiles/dev-mobile/skills/clean_gradle_cache_for_library.md`](../profiles/dev-mobile/skills/clean_gradle_cache_for_library.md) |
| Android CLI Setup | `android cli`, `install android cli`, `setup android cli`, `android update` | Installs and configures Google's Android CLI — the official terminal interface for agentic Android development. Reduces token usage by 70%+ and speeds up setup 3x. | [`../profiles/dev-mobile/skills/android_cli_setup.md`](../profiles/dev-mobile/skills/android_cli_setup.md) |
| Android Skills Setup | `android skills`, `install skills`, `browse skills`, `android knowledge` | Browses and installs official Android skills (modular SKILL.md instruction sets) via `android skills` CLI. Covers Navigation 3, edge-to-edge, AGP 9, XML-to-Compose, R8, and more. | [`../profiles/dev-mobile/skills/android_skills_setup.md`](../profiles/dev-mobile/skills/android_skills_setup.md) |