---
name: tep3-qa-instructions
description: Generates testing instructions for QA on a TEP3 ticket. Use when the user asks to "generate QA instructions", "write testing steps for QA", "add instructions to the ticket", or mentions preparing a ticket for QA handoff.
---

# TEP3 QA Instructions Generator

Generates ready-to-paste testing instructions for QA based on the scenario being tested.

---

## Step 1 — Determine the Scenario

Ask (or infer from context/ticket):
- **Product type:** standalone tickets / package / room-only
- **Flow:** sales / mods
- **Entry point:** debug page (simpler) or cart page (requires Postman setup)
- **What to verify:** the specific behavior the code change introduces

---

## Step 2 — Determine Entry Point

### Use debug page when:
- The test only needs to verify UC behavior (Guest Info, Order Summary, Confirmation)
- No cart-specific behavior is being tested
- A handshake payload is sufficient to reproduce

### Use cart page when:
- The test involves cart → UC transition
- Price change / pricing modal behavior needs real cart data
- The ticket involves cart-specific features

---

## Step 3 — Get Required Headers

Reference the override headers documentation:
- **Packages:** https://disneyexperiences.atlassian.net/wiki/spaces/DTCC/pages/183635628/DLR+TEP3+-+Package+Tickets+-+Override+Headers
- **Standalone Tickets:** https://disneyexperiences.atlassian.net/wiki/spaces/DTCC/pages/183636021/DLR+TEP3+-+Standalone+Tickets+-+Override+Headers

Common headers across all scenarios:
```
x-tep3-enabled: true
x-disney-mock-payment-session: true
```

Include route overrides for mock services as needed:
```
x-disney-internal-route-overrides: {"dps":"https://latest.mock-svc.wdprapps.disney.com", "rpva":"https://latest.mock-svc.wdprapps.disney.com", "order-svc":"https://latest.mock-svc.wdprapps.disney.com", "lodging-uc-handler":"https://latest.mock-svc.wdprapps.disney.com"}
```

Only include headers that are actually required for the scenario — don't dump all headers blindly.

---

## Step 4 — Generate Instructions

### Template (cart page entry):
```
Instructions to test this ticket: [Action with Postman], then access UC through the Cart page (make sure to use the required headers listed below). [What to verify].

Required headers:
// [Purpose of each header group]
[headers]
```

### Template (debug page entry):
```
Instructions to test this ticket: Access the UC debug page and paste the payload below. [What to verify].

Required headers:
[headers]

Payload:
[JSON payload]
```

---

## Step 5 — Output

Present the instructions ready to paste into the Jira ticket comment. Keep them concise and actionable — QA should be able to follow them without asking questions.

Then ask: "Do you want me to post this as a comment on the Jira ticket?" — if yes, use the Jira MCP to add the comment directly to the ticket.
