# Disney Land Paris Parks Digital Systems Context

## Supported Applications

This team supports 50+ applications across guest services, operations, and sales domains:

### Mobile App (GitLab)
- DLP_GUEST_MOBILE_APP — DLP Mobile App (BAPP0165730, Studio: Cruz Ramirez)

### Guest Services
- wdpr-dlp-is-guest-activity-block-provider — Guest Activity Block (BAPP0247844, Studio: Storm)
- wdpr-dlp-is-guest-activity-block-client-library — Guest Activity Block client lib (BAPP0247844, Studio: Storm)
- wdpr-dlp-is-guest-ci-consent-extractor — CI consent extractor (BAPP0177719, Studio: Storm)
- wdpr-dlp-is-guest-crm-event-v2-publisher — CRM event publishing (BAPP0177675, Studio: Storm)
- wdpr-dlp-is-guest-extended-profile-provider — Guest extended profile (BAPP0177719, Studio: Storm)
- wdpr-dlp-is-guest-gxc-disability-card-provider — Disability card (BAPP0239896, Studio: Cruz Ramirez)
- wdpr-dlp-is-guest-gxc-park-entry-ticket-bookingid-provider — Park entry ticket booking ID (BAPP0203964, Studio: Storm)
- wdpr-dlp-is-guest-gxc-tms-tickets-preloader — Ticket preloader batch, on-prem (BAPP0201208, Studio: Storm)
- wdpr-dlp-is-guest-itinerary-provider — Guest itinerary (BAPP0218964, Studio: Storm)
- wdpr-dlp-is-guest-membership-provider — Guest membership (BAPP0248634, Studio: Storm)
- wdpr-dlp-is-guest-oid-keyring-cns-prc-listener — Keyring CNS/PRC listener (BAPP0177699, Studio: Storm)
- wdpr-dlp-is-guest-oid-keyring-main-provider — Keyring main provider (BAPP0177699, Studio: Storm)
- wdpr-dlp-is-guest-oid-purge-processor — OID purge processor (BAPP0177719, Studio: Storm)
- wdpr-dlp-is-guest-oid-ticket-provider — OID ticket provider (BAPP0177699, Studio: Storm)
- wdpr-dlp-is-guest-package-digital-provider — Package digital provider (BAPP0177699, Studio: Storm)
- wdpr-dlp-is-guest-psp-payment-methods-provider — PSP payment methods (BAPP0218964, Studio: Storm)
- wdpr-dlp-is-guest-purge-extractor — Guest purge extractor (BAPP0177719, Studio: Storm)
- wdpr-dlp-is-guest-push-notification-publisher — Push notification publisher (BAPP0218964, Studio: Storm)
- wdpr-dlp-is-guest-tms-ticket-management-service-client-library — TMS client library (BAPP0201208, Studio: Storm)
- wdpr-dlp-is-guest-tms-ticket-management-service-provider — TMS provider (BAPP0201208, Studio: Storm)
- wdpr-dlp-is-guest-tms-tickets-linking-provider — Ticket linking (BAPP0203964, Studio: Storm)
- wdpr-dlp-is-guest-wallet-server-proxy-provider — Wallet server proxy (BAPP0244328, Studio: Storm)
- wdpr-dlp-is-guest-wallet-pass-purge-processor — Wallet pass purge batch (BAPP0244328, Studio: Storm)
- dlp-apps-bapp0177699-guest-portfolio-bmacs-reconciliation — BMACS portfolio reconciliation, Lambda (BAPP0177699, Studio: Storm)
- dlp-apps-bapp0177699-guest-ticket-provider — Guest ticket provider (BAPP0177699, Studio: Storm)
- dlp-apps-bapp0177719-guest-gep-consentcleaner — GEP consent cleaner (BAPP0177719, Studio: Storm)

### Operations
- wdpr-dlp-is-operations-bio-attractions-downtime-publisher — BIO attractions downtime (BAPP0215510, Studio: Storm)
- wdpr-dlp-is-operations-bio-schedules-park-provider — BIO park schedules (BAPP0215510, Studio: Storm)
- wdpr-dlp-is-operations-bio-wait-times-provider — BIO wait times (BAPP0215510, Studio: Storm)
- wdpr-dlp-is-operations-dpa-all-access-show-provider — DPA all-access show (BAPP0243936, Studio: Storm)
- wdpr-dlp-is-operations-pea-attraction-provider — ORION/PEA attraction provider (BAPP0218964, Studio: Storm)
- wdpr-dlp-is-operations-virtual-queue-provider — Virtual Queue (BAPP0243155, Studio: Storm)

### Sales & Reservations
- wdpr-dlp-is-sales-drs-book-dine-provider — Book Dine provider (BAPP0214896, Studio: Cruz Ramirez)
- wdpr-dlp-is-sales-drs-book-dine-publisher — Book Dine publisher (BAPP0214896, Studio: Cruz Ramirez)
- wdpr-dlp-is-sales-iod-food-order-provider — Mobile Order / Food Order (BAPP0229487, Studio: Cruz Ramirez)
- wdpr-dlp-is-sales-srv-digital-key-provider — Digital Key (BAPP0220148, Studio: Cruz Ramirez)
- wdpr-dlp-is-sales-srv-meet-and-greet-provider — Meet & Greet (BAPP0220648, Studio: Storm)

### Lodging
- wdpr-dlp-is-lodging-bma-magic-mobile-provider — Magic Mobile (BAPP0247141, Studio: Cruz Ramirez)
- wdpr-dlp-is-lodging-dcs-docusign-purge-processor — DocuSign purge processor (BAPP0211386, Studio: Cruz Ramirez)
- wdpr-dlp-is-lodging-ooc-dkey-business-event-processor — Digital Key business events (BAPP0220148, Studio: Cruz Ramirez)
- wdpr-dlp-is-lodging-ooc-olci-business-event-processor — OLCI business events (BAPP0211386, Studio: Cruz Ramirez)
- wdpr-dlp-is-lodging-pms-registration-form-provider — OLCI registration form (BAPP0211386, Studio: Cruz Ramirez)

### Common Services
- wdpr-dlp-is-common-api-maps-service — Maps service (BAPP0247135, Studio: Storm)
- wdpr-dlp-is-mobile-bff-core-service — Mobile BFF core (BAPP0245900, Studio: Cruz Ramirez)
- identity-sdk-web
- operations

## External System Integration

### Galaxy
- **Purpose**: Centralized guest and ticketing management
- **Integration**: Real-time ticket status, guest profiles, park entry validation
- **Common Issues**: Ticket linking, profile synchronization

### TravelBox
- **Purpose**: Travel and vacation package booking
- **Integration**: Reservation management, itinerary fulfillment
- **Common Issues**: Package availability, booking confirmation

### Bmacs
- **Purpose**: Back-office management and accounting
- **Integration**: Financial transactions, reporting, reconciliation
- **Common Issues**: Payment processing, transaction reconciliation

### DRS (Dining Reservation System)
- **Purpose**: Restaurant booking management
- **Integration**: Guest app reservations, availability updates
- **Common Issues**: Booking conflicts, notification delivery

## Common Error Patterns

### Email Notification Failures
- Missing email addresses on reservations
- Silent filtering in email preparation flows
- Misleading error messages (e.g., "reservation not found" when email is missing)

### Data Consistency Issues
- Production data quality vs. lower environments
- Missing required fields on legacy records
- ANSI character encoding problems

### Integration Failures
- 404 errors from downstream services
- Timeout issues with external systems
- Correlation ID mismatches in distributed traces

## Naming Conventions

- **WDPR**: Walt Disney Parks and Resorts
- **DLP**: Disneyland Paris
- **IS**: Integration Services
- **CME**: Commerce
- **BIO**: Business Intelligence Operations
- **DPA**: Disney Premier Access
- **PEA**: Park Entry Access
- **TMS**: Ticket Management Service
- **OID**: Online Identity
- **GXC**: Guest Experience
- **SRV**: Service
- **IOD**: In-Order Dining
- **DRS**: Dining Reservation System

## Confluence Documentation

Primary documentation: https://mywiki.disney.com/spaces/SBH/pages/926000285/1.+Applications

When Confluence MCP is available, reference this wiki and underlying pages for detailed system documentation.

## Development Practices

- Java-based microservices architecture
- Spring Boot framework
- RESTful API design
- Distributed tracing with correlation IDs
- Splunk for centralized logging
- Harness for CI/CD pipelines
- GitHub for source control

## Incident Response

- ServiceNow for incident tracking (MCP server available for direct queries)
- Jira for bug tracking and feature work
- GitHub for source control (MCP server available for code search)
- Splunk for log analysis and correlation
- Cast Tools for operational support
- Multiple environment tiers (Dev, Stage, Prod)

## Available MCP Servers

### ServiceNow MCP
Connected and active. Provides direct access to:
- Incident search and retrieval (`search_incidents`, `get_incident`)
- Change request management (`search_change_requests`, `get_change_request`)
- CMDB configuration items (`search_cmdb_ci`)
- User lookup (`search_users`)
- Generic table queries (`query_table`)
- Record creation and updates (`create_incident`, `update_incident`, `create_record`, `update_record`)

### GitHub MCP
Connected and active. Provides direct access to:
- Code search across repositories (`search_code`)
- File contents retrieval (`get_file_contents`)
- Commit history and details (`list_commits`, `get_commit`)
- Pull request management (`list_pull_requests`, `search_pull_requests`)
- Branch and tag listing (`list_branches`, `list_tags`)
- Issue and PR management


### Confluence MCP
Connected and active. Provides direct access to:
- Page search (`confluence_search`, `searchConfluenceUsingCql`)
- Page content retrieval (`getConfluencePage`, `confluence_get_page`)
- Space listing (`getConfluenceSpaces`)
- Page creation and updates (`createConfluencePage`, `updateConfluencePage`)

### Jira MCP
Connected and active. Provides direct access to:
- Issue search via JQL (`searchJiraIssuesUsingJql`)
- Issue details (`getJiraIssue`)
- Issue creation and updates (`createJiraIssue`, `editJiraIssue`)
- Transitions (`transitionJiraIssue`)
- Comments (`addCommentToJiraIssue`)
