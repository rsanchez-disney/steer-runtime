---
inclusion: always
---

# EAI Hub DRP — Product Context

## Identity

- **System**: Enterprise Application Integration Hub for Disneyland Resort Paris
- **Role**: Central message-based middleware broker for DLP travel booking and reservation operations
- **BAPP ID**: BAPP0192039
- **Assignment Group**: app-flwdw-drpeai

## Technology Stack

See `tech.md` for full technology stack details.

## Architecture & Structure

See `structure.md` for full module structure, package conventions, configuration file locations, dependency flow, and naming conventions.

## Message Processing Flow

1. Consumer sends XML via HTTPS to `/msgsvcs-rs/services/message`
2. Channel resolved from `From.Party.Id` header → `SBC` or `DRP`
3. Source adapter validates, translates, normalizes
4. Functional Broker routes to target adapter based on message type
5. Service Broker applies pre/post transforms
6. Target adapter converts to backend-specific format and invokes
7. Response flows back through the chain in reverse

## Routing Rules

- Default target: TbxAdapter (`FORWARD_broker`)
- Exceptions: OfferQuery → RecommenderAdapter, TravelWish → MarketingTargetAdapter

## Consumer Channels

| Channel ID | System | Description |
|-----------|--------|-------------|
| `SBC` | Sales & Business Center | Agent-facing CRO for Offer Based Selling |
| `DRP` | Web Package | Guest-facing online booking engine |

## Backend Systems

| System | Protocol | Purpose |
|--------|----------|---------|
| TBX (TravelBox) | SOAP/HTTPS (OTA V65) | System of Record for reservations |
| Recommender Adapter | SOAP/HTTPS (WSDL) | Package offer discovery via PVaaS |
| PVaaS | REST/HTTPS | Package validation and code translation |
| APP (WorldPay) | HTTPS | Payment authorization (MOTO) |

## Exposed Endpoints

- `POST /msgsvcs-rs/services/message/` — Main message processing
- `POST /msgsvcs-rs/services/message/pp/` — Payment processing
- `POST /msgsvcs-rs/services/message/ppp/` — Package payment processing
- `GET /msgsvcs-rs/services/message/healthcheck` — Health check
- `GET /msgsvcs-rs/services/message/deephealthcheck` — Deep health check
- `GET /msgsvcs-rs/services/admin/` — Admin/diagnostic operations

## Coding Conventions

- All internal messaging uses XML; JAXB-annotated domain classes
- Processor classes are registered in `processor.properties` by root XML element name
- Service rules are chained via `servicebroker.properties`
- Configuration is externalized in environment-specific property files under DRPHubEAR
- PCI-sensitive data (credit cards) must use JKS keystores and BouncyCastle encryption
- Credit card numbers must be masked in all log output
- Timezone conversions use EnterpriseServiceRules (never raw offset arithmetic)
- Session management is per-agent; respect `SessionRQ/RS` lifecycle
- PaymentRQ is a secured message requiring auth token validation

## Testing Rules

See `tech.md` for testing tools and `structure.md` for testing structure. Additional rules:

- Cover message transformation, routing, error paths, and adapter behavior

## Deployment

- AWS ECS on PCI-compliant VPCs (`pci-apps-nb-use1-*`)
- Monitoring via AppDynamics + CloudWatch Dashboards
- Infrastructure managed via Terraform (`ee-infra-config` repo)

## Environments

| Environment | Host prefix |
|-------------|-------------|
| Dev (Latest) | `latest.dlp-eai.wdprapps.disney.com:8443` |
| Stage | `stage.dlp-eai.wdprapps.disney.com:8443` |
| Load | `load.dlp-eai.wdprapps.disney.com:8443` |
| Production | `dlp-eai.wdprapps.disney.com:8443` |

## Key Message Types (Active)

- **Accommodation**: RoomQuoteRQ, RoomResRQ, RoomAvailabilityRQ
- **Misc Products**: MiscAvailabilityRQ, MiscQuoteRQ, MiscResRQ
- **Itinerary**: ItineraryDetailsRQ, ItinerarySummaryRQ, ItineraryCancelRQ, ItineraryConfirmationRQ, ItineraryUpdateRQ, ItineraryNotesRQ, ComponentCancelRQ, CancellationPenaltyQueryRQ, ResCommentsRQ
- **Guest**: GuestQueryRQ, GuestRQ, ModifyPaxInfoRQ, OrganizationDetailsRQ
- **Payments**: PaymentRQ (multi-step: TBX booking → APP auth → TBX payment import)
- **Offers**: OfferQueryRQ, OfferTemplateQueryRQ (routed to Recommender)
- **System**: SessionRQ, PingRQ, EAISystemHealthRQ
- **Deprecated**: Air* messages, Transport* messages, Vehicle* messages