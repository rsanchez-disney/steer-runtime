<!-- owner: @disney-payments-core -->
<!-- last-updated: 2026-04-08 -->
# Config Studio — Flows

## Configuration Management Flow
1. User logs into Config Studio (Angular UI) via Disney SSO
2. UI calls payment-controls-api (Node BFF) for configuration list
3. BFF proxies to config-services (Java) with auth token
4. User creates/edits configuration via form
5. Changes saved through BFF → config-services → Oracle DB
6. Audit trail recorded for all changes

## Rule Evaluation Flow
1. User selects a configuration and clicks "Test Rules"
2. UI sends test transaction payload to BFF
3. BFF forwards to config-services `/rules/evaluate`
4. Results displayed with applied rules and allow/deny decision

## Key Differences
Config Studio is an internal admin tool — not customer-facing. All users are Disney cast members with SSO authentication. No guest checkout or cart flows.
