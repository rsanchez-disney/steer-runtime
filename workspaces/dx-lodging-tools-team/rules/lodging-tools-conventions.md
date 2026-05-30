# DX Lodging Tools — Conventions

## Architecture Pattern (SPA → WebAPI → VA)

- All guest/cast-facing features follow the 3-tier pattern: SPA (Angular) → WebAPI (Node.js) → VA (Java/Spring Boot)
- WebAPIs are BFF intermediaries — no business logic, only orchestration and response mapping
- VAs (View Assemblies) orchestrate calls to core services (TravelBox, PMS, Payment Services)
- Batch lambdas (Ticket Order, Ticket & Voucher) are Node.js on AWS Lambda

## Deployment

- All services deploy via Harness
- Rundeck for operational tasks: `rundeck.wdprapps.disney.com/project/{app-name}_aws/jobs`
- All environments follow: `{env}.{service}.wdprapps.disney.com` (latest/stage/load/prod)

## Feign Connectors (VA layer)

- All downstream calls from VAs use Feign clients
- Monitor Feign connector error rates via Splunk alerts
- Known connectors: PackageEntitlementServiceConnector, PackageReservationRetrieveConnector, ResortPackageVAFeignConnector, OlciVAServiceConnector

## Splunk

- Dedicated Splunk App: `rocket` at `splunk.wdprapps.disney.com/en-GB/app/rocket/`
- Alert naming: `Alert: {Branch} {App} [{Alert_description}]`
- Alert scripts repo: `github.disney.com/studio-expedition/trade-splunk-scripts`
- For "Lost Splunk Logs" → check `#dx-splunk` first

## PMS RabbitMQ Integration

- Package Entitlement Service consumes guest action events from PMS
- Exchange: `PSPKGENTTL.GUESTACTION` / Queue: `PSPKGENTTL.GUESTACTION.DLRGEMSUB`
- Events: CLAIM, UNCLAIM, REENCODE, DISABLE
- Resort codes: PH (Paradise Hotel), DH (Disneyland Hotel), CH (Grand Californian), CV (Villas)
