# Service → Repository Mapping — Studio Anglerfish (iOS)

## iOS Application Repos

| Repo                                | Acronym | Default Branch | Purpose                                       |
|-------------------------------------|---------|----------------|-----------------------------------------------|
| studio-anglerfish/wdpr-dine-opp     | MO      | `master`       | Mobile Order iOS app                          |
| studio-anglerfish/wdpr-dine-checkin | DMC     | `master`       | Dine Mobile Check-in & Walk-up Lists          |
| studio-anglerfish/Scan-and-Go       | MMC     | `master`       | Merchandise Mobile Checkout (Scan and Go)     |
| studio-anglerfish/wdpr-bolton       | —       | `master`       | Bolton iOS app                                |
| studio-anglerfish/fnb-shared        | —       | `main`         | Shared FNB code across MO, DMC, MMC           |
| studio-anglerfish/wdpr-bootstrap    | —       | `master`       | Bootstrap framework (login, finder, geofence) |

### SPM Mirror Repos

These repos exist solely to provide Swift Package Manager support for their parent repos:

| Repo                                        | Mirrors               |
|---------------------------------------------|-----------------------|
| studio-anglerfish/wdpr-dine-opp-spm         | wdpr-dine-opp         |
| studio-anglerfish/wdpr-dine-checkin-spm     | wdpr-dine-checkin     |
| studio-anglerfish/Scan-and-Go-spm           | Scan-and-Go           |
| studio-anglerfish/wdpr-bolton-spm           | wdpr-bolton           |
| studio-anglerfish/fnb-shared-spm            | fnb-shared            |
| studio-anglerfish/wdpr-bootstrap-spm        | wdpr-bootstrap        |
| studio-anglerfish/wdpr-bootstrap-login-spm  | wdpr-bootstrap-login  |
| studio-anglerfish/wdpr-bootstrap-finder-spm | wdpr-bootstrap-finder |
| studio-anglerfish/wdpr-geofence-manager-spm | wdpr-geofence-manager |


## Shared Platform Repos

| Library / Framework     | Org          | Host              | Purpose                                           |
|-------------------------|--------------|-------------------|---------------------------------------------------|
| wdpro-mobile (platform) | wdpro-mobile | github.disney.com | Shared iOS platform (networking, auth, analytics) |

## GitHub Orgs

| Org               | URL                                         | Purpose             |
|-------------------|---------------------------------------------|---------------------|
| studio-anglerfish | https://github.disney.com/studio-anglerfish | Feature app repos   |
| wdpro-mobile      | https://github.disney.com/wdpro-mobile      | Shared iOS platform |

## Backend Services (consumed by iOS apps)

These services are owned by Studio Lumiere but consumed by Anglerfish iOS apps:

| Service                             | Purpose                                | API Style |
|-------------------------------------|----------------------------------------|-----------|
| MOO (Mobile Ordering Orchestration) | Order placement, status, payment       | REST      |
| DiSCO (Dine Self Check-In)          | Self check-in flow                     | REST      |
| Arrival Windows                     | Pickup time slots                      | REST      |
| MDX                                 | Experience APIs (venues, menus, times) | REST      |
| VenueNext                           | Order fulfillment                      | REST      |
| APP (Disney Payments)               | Payment processing                     | REST      |

## Build & Distribution

| Tool                     | Purpose                    |
|--------------------------|----------------------------|
| Xcode 15+                | Build and archive          |
| Swift Package Manager    | Feature-level dependencies |
| TestFlight             | Beta distribution          |
| GitHub Actions / Jenkins | CI pipeline                |

## Monitoring

| Tool            | Purpose                          |
|-----------------|----------------------------------|
| New Relic       | App performance, crash reporting |
| Adobe Analytics | User behavior tracking           |
