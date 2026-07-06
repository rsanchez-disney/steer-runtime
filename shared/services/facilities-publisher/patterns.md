<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Facilities Publisher — Patterns & Conventions

## Error Handling

Sync results are returned as a `Map<DatabaseType, Report>`. Each `Report` contains success/failure status and document counts. Errors are logged but do not halt the sync for other facility types.

## Feature Flags (LaunchDarkly)

Feature flags control:
- TXP-specific facility publishing (`FeatureToggleTxpConfiguration`)
- Individual feature toggles per facility type or destination

Flags are managed via LaunchDarkly with a dedicated Harness pipeline for flag lifecycle.

## Multi-Database Writes

Facilities are written to multiple Couchbase databases:
- `park-platform-pub` — primary public bucket for mobile apps
- TXP public bucket — secondary destination for TXP consumers

## Locale Processing

Facilities are processed per locale using a dedicated thread pool (`LocaleThreadPoolConfig`) for parallel locale transformation.

## Category & CTA Mappings

- **Categories**: Configured via `CategoriesConfiguration` — maps facility types to display categories
- **CTA (Call-to-Action)**: `CtaMappingConfig` / `CtaPropertyConfig` — maps facilities to action buttons
- **Avatar Taxonomy**: `AvatarTaxonomyConfiguration` — character/avatar associations

### CTA Rules

CTAs are server-driven buttons on the mobile app (Detail Screen and Map Screen). Each CTA has:
- **Data rules** — conditions on facility properties (e.g., `facility.latitude != 0.0`)
- **Facet rules** — Watcher facets that enable/disable the CTA (e.g., `"mobile-orders"`)
- **LaunchDarkly toggles** — feature flags controlling CTA visibility and min app version
- **Destination scope** — which parks support the CTA (wdw, dlr, hkdl)

Key CTAs managed by Facilities Publisher:

| CTA | Destinations | Controlled By |
|-----|-------------|---------------|
| findOnMap | wdw, dlr, hkdl | Data rules (lat/lng) + facet `mobile-hide-map` |
| mobileOrderFood | wdw, dlr, hkdl | Facet `mobile-order-food` |
| walkUpList | wdw, dlr | Facet `walkupWaitList` |
| findATable | wdw, dlr, hkdl | Data rules (type=restaurant) + facet `reservations-accepted` |
| orderFood | wdw, dlr | Facet `mobile-orders` + LaunchDarkly |
| callToBook | wdw, dlr, hkdl | Data rules (phoneNumber) + LaunchDarkly |
| getDirections | wdw | Data rules (lat/lng) + facet `mobile-hide-get-directions` |
| carLocator | wdw, dlr | Facet `mobile-car-locator` |
| standByPass | wdw, hkdl | Facet `stand-by-pass` |
| playDisneyParks | wdw, dlr | Data rules (deepLinks) + facet + LaunchDarkly |

Full CTA rules reference: [Confluence Cloud — CTA Rules](https://disneyexperiences.atlassian.net/wiki/spaces/DSI/pages/910729902/CTA+Rules)

## Idempotency

Full-replacement sync — each run fetches complete current state and upserts all documents. Safe to retry.

## Common Gotchas

- Destination enum is case-sensitive in path variable binding
- LaunchDarkly flags can silently disable publishing for specific facility types — check flag state when debugging missing data
- Watcher client provides extended categories that override base category config
- Thread pool for locale processing can be a bottleneck under high locale count
