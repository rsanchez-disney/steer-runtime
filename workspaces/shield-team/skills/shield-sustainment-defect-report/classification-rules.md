# Classification Rules

## Real vs Misclassified

An issue is **misclassified** (not a real defect) if its summary matches ANY of:

| Pattern | Reason |
|---|---|
| starts with `[ENG]` | Engineering task |
| contains `SonarQube` | Code quality / coverage |
| contains `Jacoco` | Test coverage config |
| contains `Grafana` | Monitoring/observability task |
| contains `Vendomatic` | Internal tooling retirement |
| contains `Monorepo` | Infrastructure / build |
| contains `(CICD)` or `[CICD]` | Pipeline issue |
| contains `unit test` or `unit-test` | Test improvement |
| contains `Ingestion failed` | App Store / TestFlight submission failure |
| contains `code coverage` | Coverage task |

Everything else is treated as a **real defect** (`isReal = true`).

---

## Functional Area Classification

Apply the **first matching rule** (order matters):

| Area | Keywords in summary (case-insensitive) |
|---|---|
| **Crashes** | `crash`, `crashing`, `NullPointerException`, `NullPointer`, `NewRelic`, `Google Crash`, `Google Console`, `TransactionTooLarge`, `ANR`, `IllegalState`, `lateinit`, `OutOfMemory` |
| **Finder / Map / Wayfinding** | `Finder`, `Wayfinding`, `wayfinding`, `Map Finder`, `map pin`, `Map Pin`, `Get Directions`, `closure banner`, `interactive map` |
| **Analytics / Tracking** | `analytics`, `Analytics`, `trackAction`, `track action`, `tracking`, `Warrior Analytics`, `PageDetailName`, `screen name` |
| **Content / CMS Issues** | `(Content)`, `[Content]`, `(content)`, label=`content` or label=`Content` |
| **Dashboard / Home Screen** | `Dashboard`, `Home Screen`, `homescreen`, `Homescreen`, `home page` |
| **Notification / Chat** | `Notification Center`, `Chat with Us`, `LivePerson`, `Salesforce`, `async-messaging`, `push notification` |
| **Lightning Lane / Genie** | `Lightning Lane`, `Genie`, `LLMP`, `LLSP`, `LLPP`, `LL Hub`, `LL Premier`, `Premiere Pass` |
| **Search** | `search screen`, `no results`, `search field`, `search box`, `Observing results` |
| **Localization / Content** | `Spanish`, `translation`, `L10n`, `Localization`, `COREEXP`, `not translated`, `language`, `JA/KO`, `SC/TC` |
| **FTUE / Onboarding** | `FTUE`, `onboarding`, `fresh install`, `Onboarding`, `permissions skipped` |
| **Resort Reservation** | `Resort Reservation`, `Link Resort`, `OLCI` |
| **Performance** | `Spinner`, `slow`, `takes over 3 sec`, `launch time`, `Performance`, `load time`, `observability` |
| **Edge-to-Edge (Android)** | `Edge-to-Edge`, `edge-to-edge`, `EdgeToEdge` |
| **Security** | `Security`, `encryption`, `FIND-`, `Red Team`, `encrypt` |
| **Other** | Everything else |

---

## Category (deep-dive breakdown table)

| Category tag | Conditions |
|---|---|
| `Crash` | area = Crashes |
| `Security` | area = Security |
| `Localization` | area = Localization/Content |
| `Performance` | area = Performance |
| `Content` | area = Content/CMS Issues |
| `App Bug` | isReal=true AND area not in (Crashes, Security, Localization, Performance, Content) |
| `Tech Debt` | isReal=false AND summary doesn't match CI/CD patterns |
| `CI/CD & Build` | isReal=false AND summary matches `[ENG]`, `SonarQube`, `Jacoco`, `CICD`, `Monorepo`, `unit test` |
| `Ingestion` | summary matches `Ingestion failed` |

---

## Monthly Notes (auto-generate)

Scan each month's issues for these signals and compose a short note (≤12 words):

| Signal | Note fragment |
|---|---|
| label `in_park` or summary contains `in-park` | "In-park testing surge" |
| ≥10 SonarQube tickets | "SonarQube/coverage campaign" |
| ≥5 crash tickets | "Crash cluster" |
| ≥5 Localization tickets | "L10n rollout activity" |
| ≥5 Content tickets | "Content/CMS issues" |
| 0 real defects | "No real defects filed" |
| month is Dec or Nov AND real < AVG | Append "Holiday slowdown" |
