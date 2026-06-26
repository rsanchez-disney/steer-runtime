---
inclusion: auto
description: Local dev startup commands for all payment platform services
---

# Local Dev Setup

## Payment Controls Stack
| Service | Command | Port |
|---------|---------|------|
| wdpr-payment-controls-client | `npm run start:proxy:dev` | 3000 |
| wdpr-payment-controls-api | `npm run start:local` | 8625 |

## Payment Sheet / Demo Stack
| Service | Node Version | Command | Port |
|---------|-------------|---------|------|
| wdpr-payment-demo | `nvm use 10.15.3` | `grunt serve` | 8888 |
| wdpr-payment-demo-api | `nvm use 16.17.1` | `grunt serve` | 8628 |
| wdpr-payment-sheet | `nvm use 10.15.3` | `npm run start:proxy:dev` | 3000 |
| wdpr-payment-sheet-api | `nvm use 16.17.1` | `grunt serve` | 8625 |

## Port Conflicts
- Port 3000: payment-sheet OR payment-controls-client (not both)
- Port 8625: payment-sheet-api OR payment-controls-api (not both)
- Port 8888: payment-demo (can coexist with payment-sheet on 3000)

## GCP Admin Stack
| Service | Node Version | Command | Port |
|---------|-------------|---------|------|
| wdpr-gcp-admin-api | `nvm use 20.19.5` | `npm run start:local` | 8627 |

Note: wdpr-gcp-admin (legacy UI) is deprecated and will not be launched locally.

## Admin Inquiry Stack
| Service | Node Version | Command | Port |
|---------|-------------|---------|------|
| dpay-admin-inquiry-webapi | `nvm use 20.19.5` | `npm run start:local` | 8627 |

Note: dpay-admin-inquiry-ui-client (legacy UI) is deprecated and will not be launched locally.

## GCP Backend (Java)
| Service | Java Version | Command | Port |
|---------|-------------|---------|------|
| gcp-admin-services | Java 21 (`JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.7/...`) | `./run-local.sh` | 8080 |

Note: Requires `.env` copied from `.env.original`. Connects to Latest MariaDB RDS. Needs VPN or internal DNS for Keystone (`stage.keystone.wdprapps.disney.com`). For external access use `api.keystone-stg.disney.com` with adjusted endpoint paths in `.env`.
