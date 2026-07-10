  # 📊 Comprehensive Incident Report Template

  Full-featured incident analysis and resolution report with detailed metrics, timelines, and stakeholder communication.

  ## When to Use

  - Complex incidents requiring detailed forensic analysis
  - P1/P2 incidents with significant business impact
  - Incidents that need executive-level reporting
  - Cases where no fix was found but impact documentation is needed
  - Vendor/third-party root cause incidents
  - Multi-day incidents with evolving timelines
  - Incidents requiring post-mortem with follow-up actions

  ## Template Features

  1. **Dynamic status banner** — Visual indicator (RESOLVED/MITIGATED/ACTIVE) with color coding
  2. **KPI cards** — Days active, users impacted, errors identified, resolution status
  3. **Dual-audience sections:**
     - Non-Technical Summary for business stakeholders
     - Technical Summary for engineering teams
  4. **Comprehensive data tables:**
     - Affected flows with external dependency tracking
     - Service details and deployment information
     - Error breakdown by category with percentages
     - Timeline with milestone tracking
     - Geographic/platform impact scope
     - Post-fix reports to track false positives
     - Remediation actions with status tracking
  5. **ASCII flow diagram** — Technical request flow visualization
  6. **Reference links** — Incident tickets, vendor tickets, repositories, runbooks, dashboards

  ## Status Banner Colors

  RESOLVED  → Green  (#ecfdf5 background / #059669 text/border)
  MITIGATED → Amber  (#fffbeb background / #d97706 text/border)
  ACTIVE    → Red    (#fef2f2 background / #dc2626 text/border)

  ## How to Generate

  When generating this template, replace ALL bracketed placeholders with actual incident data:

  | Placeholder | Example | Description |
  |-------------|---------|-------------|
  | `[INCIDENT_ID]` | INC0123456 | ServiceNow incident number |
  | `[Incident Title]` | Notification Delivery Failure | Short incident description |
  | `[DD-Mon-YYYY]` | 10-Jul-2026 | Date format |
  | `[Start date]` / `[End date]` | 01-Jul-2026 to 10-Jul-2026 | Incident period |
  | `[X]` | 12, 2450, 847 | Calculated values (days, counts, percentages) |
  | `[SWID]` | guest123 | Guest identifier |
  | `[Vendor Name]` | Agilysys, OneID, etc. | Third-party service name |
  | `[Resolution date]` | 08-Jul-2026 | Date fix was applied |
  | `[Service/feature]` | Mobile Order, Digital Key | Affected capability |

  Color-code the status banner based on current incident state.

  ## HTML Template

  Wrap the generated HTML in `[code]...[/code]` for ServiceNow work notes compatibility.

```html
  <!--
    Generic Incident Report Template
    ─────────────────────────────────
    Replace bracketed placeholders (e.g. [INCIDENT_ID]) with real values.
    Status banner colors:
      RESOLVED  → green  (#ecfdf5 / #059669)
      MITIGATED → amber  (#fffbeb / #d97706)
      ACTIVE    → red    (#fef2f2 / #dc2626)
  -->
  <html>
  <body style="font-family: Arial, sans-serif; font-size: 14px; color: #1f2937; line-height: 1.6; margin: 0; padding: 20px;
  background-color: #f9fafb;">
  <div style="max-width: 860px; margin: 0 auto; background: #fff; border-radius: 10px; border: 1px solid #e5e7eb; padding: 28px;">

    <h1 style="color: #111827; font-size: 22px; margin: 0 0 6px 0;">[INCIDENT_ID] — [Incident Title] Summary</h1>
    <p style="color: #6b7280; font-size: 13px; margin: 0 0 20px 0;">[One-line issue summary] | [Resolution/update] date:
  [DD-Mon-YYYY] | Incident period: [Start date] to [End date] ([X] days)</p>

    <!-- STATUS BANNER — swap background/border colors per status (see header comment) -->
    <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 14px 16px; margin: 0 0 24px 0; border-radius: 6px;">
      <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #059669;">✅ RESOLVED</p>
      <p style="margin: 0;">[Vendor/team] applied the fix on <strong>[Resolution date]</strong>. [Service/feature] restored to
  normal operation. No new occurrences of the original issue since [Monitoring cutoff date].</p>
    </div>

    <!-- KPI CARDS -->
    <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0; margin: 0 0 24px 0;">
      <tr>
        <td style="width: 25%; text-align: center; background: #f3f4f6; border-radius: 8px; padding: 14px 8px;">
          <div style="font-size: 28px; font-weight: 700; color: #dc2626;">12</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Days Active</div>
        </td>
        <td style="width: 25%; text-align: center; background: #f3f4f6; border-radius: 8px; padding: 14px 8px;">
          <div style="font-size: 28px; font-weight: 700; color: #dc2626;">2,450</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Users Impacted</div>
        </td>
        <td style="width: 25%; text-align: center; background: #f3f4f6; border-radius: 8px; padding: 14px 8px;">
          <div style="font-size: 28px; font-weight: 700; color: #dc2626;">847</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Errors Identified</div>
        </td>
        <td style="width: 25%; text-align: center; background: #f3f4f6; border-radius: 8px; padding: 14px 8px;">
          <div style="font-size: 28px; font-weight: 700; color: #059669;">✅ Fixed</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">[DD-Mon-YYYY]</div>
        </td>
      </tr>
    </table>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- NON-TECHNICAL SUMMARY -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h2 style="color: #1e40af; font-size: 18px; margin: 28px 0 12px 0; border-bottom: 2px solid #dbeafe; padding-bottom: 6px;">📋
  Non-Technical Summary</h2>

    <h3 style="color: #374151; font-size: 14px; margin: 16px 0 8px 0;">What happened?</h3>
    <p style="font-size: 13px; margin: 0 0 12px 0;">
      [Describe the affected business process in plain language. Example:] Customers attempting to complete an online checkout
  flow were unable to receive order confirmation notifications. The checkout itself completed successfully, but downstream
  notification delivery failed silently.
    </p>
    <p style="font-size: 13px; margin: 0 0 12px 0;">
      Starting <strong>[Start date]</strong>, [symptom description — e.g. notifications stopped being delivered / API responses
  returned errors / page load times exceeded SLA]. Users experienced [user-visible impact] without an error message in the
  application.
    </p>

    <h3 style="color: #374151; font-size: 14px; margin: 16px 0 8px 0;">Who was affected?</h3>
    <ul style="font-size: 13px; margin: 0 0 12px 0; padding-left: 20px;">
      <li><strong>~2,450 users</strong> across [regions/markets — e.g. North America, EMEA, APAC]</li>
      <li>[Segment detail — e.g. Premium tier subscribers, mobile app users only]</li>
      <li>[Scope limitation — e.g. Guest checkout unaffected; logged-in users only]</li>
      <li>~65% of failures correlated with [platform/provider — e.g. a specific CDN edge, email provider, or payment gateway]</li>
    </ul>

    <h3 style="color: #374151; font-size: 14px; margin: 16px 0 8px 0;">What was the cause?</h3>
    <p style="font-size: 13px; margin: 0 0 12px 0;">
      A third-party integration ([Vendor Name]) had [root cause in plain language — e.g. misconfigured authentication, expired
  certificate, rate-limit misalignment]. This caused [downstream effect — e.g. message delivery failures, timeout errors] for
  requests routed through that integration.
    </p>
    <p style="font-size: 13px; margin: 0 0 12px 0;">
      <strong>No defect was found in [Your Team]'s application code.</strong> Internal logs confirmed requests were formed and
  dispatched correctly; the failure occurred after handoff to the external service.
    </p>

    <h3 style="color: #374151; font-size: 14px; margin: 16px 0 8px 0;">How was it resolved?</h3>
    <p style="font-size: 13px; margin: 0 0 12px 0;">
      [Vendor/team] corrected [specific fix — e.g. DNS records, API credentials, deployment config] on <strong>[Resolution
  date]</strong>. From [next business day] onward, all new requests processed successfully. The remaining impact window closed on
  [Cutoff date] once in-flight transactions cleared.
    </p>

    <h3 style="color: #374151; font-size: 14px; margin: 16px 0 8px 0;">Current status</h3>
    <p style="font-size: 13px; margin: 0 0 12px 0;">
      The issue is <strong>fully resolved</strong>. Any new reports after [Cutoff date] are attributed to [known non-system causes
  — e.g. user input errors, expired sessions], not the original incident.
    </p>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- TECHNICAL SUMMARY -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <h2 style="color: #1e40af; font-size: 18px; margin: 28px 0 12px 0; border-bottom: 2px solid #dbeafe; padding-bottom: 6px;">🔧
  Technical Summary</h2>

    <!-- Root Cause -->
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 16px; margin: 0 0 20px 0; border-radius: 6px;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #991b1b;">Root Cause</p>
      <p style="margin: 0;">[Technical root cause — e.g. Expired TLS certificate on vendor API endpoint caused HTTP 502 responses.
  Internal retry logic exhausted after 3 attempts; messages were dead-lettered without user-facing error.]</p>
    </div>

    <!-- Affected Flow -->
    <h3 style="color: #374151; font-size: 14px; margin: 16px 0 8px 0;">Affected flows</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 0 0 16px 0;">
      <thead>
        <tr>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Flow / Endpoint</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Actor</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Mechanism</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">External dep?</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;"><code>POST /api/v1/orders/confirm</code></td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">End user</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Synchronous API</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">No</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: 600;">✅ Never
  affected</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;"><code>POST /api/v1/notifications/send</code></td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Background worker</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Async queue → vendor API</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;"><strong>Yes</strong></td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: 600;">❌ Affected (now
  fixed)</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;"><code>GET /api/v1/orders/{id}/status</code></td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">End user</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Read-only lookup</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">No</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: 600;">✅ Never
  affected</td>
        </tr>
      </tbody>
    </table>

    <!-- Service & Code -->
    <h3 style="color: #374151; font-size: 14px; margin: 16px 0 8px 0;">Service details</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 0 0 16px 0;">
      <tbody>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 30%;">Service</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;"><code>acme-notification-service</code> (v2.4.1)</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Code change?</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">No — no deploys during incident window</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Internal errors?</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">None upstream. Vendor API returned HTTP 502 /
  connection timeout</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Vendor tickets</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">#VND-88201, #VND-88456</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Deploy / commit</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;"><code>a1b2c3d4e5f6...</code> (last known-good
  build)</td>
        </tr>
      </tbody>
    </table>

    <!-- Error Breakdown -->
    <h3 style="color: #374151; font-size: 14px; margin: 16px 0 8px 0;">Error breakdown (847 identified failures)</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 0 0 16px 0;">
      <thead>
        <tr>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Category</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: center;">Count</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: center;">%</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #fef2f2;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">HTTP 502 — Bad Gateway (vendor)</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;"><strong>612</strong></td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;"><strong>~72%</strong></td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Connection timeout (&gt;30s)</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">178</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">~21%</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Other (rate limit, malformed response)</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">57</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">~7%</td>
        </tr>
      </tbody>
    </table>

    <!-- TIMELINE -->
    <h2 style="color: #1e40af; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 2px solid #dbeafe; padding-bottom: 6px;">📅
  Timeline</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 0 0 16px 0;">
      <thead>
        <tr>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Date / Time (UTC)</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Event</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;"><strong>01-Jul-2026 08:15</strong></td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">🔴 Issue detected — monitoring alert: notification
  delivery error rate &gt; 5%. Incident opened as P3.</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">01-Jul-2026 09:00</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">On-call engineer confirms vendor API returning 502.
  Vendor support ticket #VND-88201 opened.</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">02-Jul-2026 14:30</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Impact assessment published: ~1,200 users affected.
  Escalated to P2 due to volume.</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">03-Jul-2026 10:00</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Vendor confirms expired TLS certificate as root cause.
  ETA for fix: 48 hours.</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">05-Jul-2026 16:45</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">War-room call with vendor. Temporary workaround:
  failover to secondary endpoint enabled.</td>
        </tr>
        <tr style="background: #ecfdf5;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;"><strong>08-Jul-2026 11:20</strong></td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">✅ <strong>FIX APPLIED</strong> — Vendor renewed
  certificate and redeployed primary endpoint.</td>
        </tr>
        <tr style="background: #ecfdf5;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;"><strong>08-Jul-2026 14:00</strong></td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">✅ Resolution update published. Error rate returned to
  baseline (&lt; 0.1%).</td>
        </tr>
        <tr style="background: #ecfdf5;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;"><strong>10-Jul-2026 09:00</strong></td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">✅ Remaining impact window closed. Dead-letter queue
  reprocessed successfully.</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">10-Jul-2026 15:30</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Post-incident review scheduled. Follow-up tickets
  created for monitoring improvements.</td>
        </tr>
      </tbody>
    </table>

    <!-- FLOW DIAGRAM -->
    <h2 style="color: #1e40af; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 2px solid #dbeafe; padding-bottom: 6px;">🔄
  Request Flow (Technical)</h2>
    <pre style="background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; font-size: 11px; overflow-x: auto; margin:
  0 0 16px 0;">
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ HAPPY PATH — UNAFFECTED FLOW                                            │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ 1. Client → POST /api/v1/orders/confirm                                 │
  │ 2. Order service persists order → returns 201                           │
  │ 3. Client receives confirmation in-app                                  │
  │ Result: ✅ Always worked during incident                                │
  └─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │ AFFECTED FLOW — NOTIFICATION DELIVERY                                   │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ 1. Order service → enqueue NotificationEvent                            │
  │ 2. Worker dequeues → POST vendor-api.example.com/v1/send                │
  │ 3. ❌ Vendor returns HTTP 502 (expired TLS cert) → Jul 1 – Jul 8       │
  │ 4. Message dead-lettered after 3 retries                                │
  │ 5. ✅ Vendor cert renewed → Jul 8 onward, delivery restored              │
  └─────────────────────────────────────────────────────────────────────────┘</pre>

    <!-- GEOGRAPHIC SPREAD -->
    <h2 style="color: #1e40af; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 2px solid #dbeafe; padding-bottom: 6px;">🌍
  Impact Scope</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 0 0 16px 0;">
      <thead>
        <tr>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Dimension</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Values</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Regions</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">US-East, US-West, EMEA, APAC</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Environments</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Production only (staging/dev unaffected)</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">User segments</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Registered users with email notifications enabled</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Platforms</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Web, iOS, Android (all equally affected)</td>
        </tr>
      </tbody>
    </table>

    <!-- POST-FIX FOLLOW-UPS -->

    <h2 style="color: #1e40af; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 2px solid #dbeafe; padding-bottom: 6px;">⚠️
  Post-Fix Reports (Not Related to Original Incident)</h2>
    <p style="font-size: 12px; color: #6b7280; margin: 0 0 12px 0;">After the fix, some new reports were linked to this incident.
  Investigation confirmed they are unrelated:</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 0 0 16px 0;">
      <thead>
        <tr>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Reference ID</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">User reported</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">System record</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Verdict</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">ORD-1048291</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">john.smith@example.com</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">johnsmith@exampel.com</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; color: #d97706;">Email typo (user input)</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">ORD-1050147</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Notifications disabled in profile</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">opt_out = true</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; color: #d97706;">User preference (not a bug)</td>
        </tr>
      </tbody>
    </table>
    <p style="font-size: 12px; margin: 0 0 16px 0;">
      <strong>Guidance for support teams:</strong> For new reports after [Cutoff date], verify user contact details and
  notification preferences before escalating. Escalate with Reference ID + timestamp if delivery fails with correct data.
    </p>

    <!-- REMEDIATION -->
    <h2 style="color: #1e40af; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 2px solid #dbeafe; padding-bottom: 6px;">🔧
  Remediation &amp; Follow-up Actions</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 0 0 16px 0;">
      <thead>
        <tr>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Action</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Detail</th>
          <th style="background: #1e3a5f; color: #fff; padding: 8px 10px; text-align: left;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Reprocess dead-letter queue</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">847 messages re-enqueued and delivered
  successfully</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; color: #059669;">✅ Complete</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Add vendor health check</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Synthetic probe every 60s on vendor API endpoint</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; color: #059669;">✅ Complete</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Failover automation</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Auto-switch to secondary vendor after 3 consecutive
  failures</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; color: #d97706;">🔄 In progress</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Post-incident review (PIR)</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb;">Scheduled for [PIR date] — action items to be tracked
  in [TICKET-123]</td>
          <td style="padding: 7px 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">📅 Scheduled</td>
        </tr>
      </tbody>
    </table>

    <!-- REFERENCES -->
    <h2 style="color: #1e40af; font-size: 16px; margin: 24px 0 12px 0; border-bottom: 2px solid #dbeafe; padding-bottom: 6px;">📎
  References</h2>
    <ul style="font-size: 12px; margin: 0; padding-left: 20px;">
      <li style="margin-bottom: 6px;"><strong>Incident ticket:</strong> <a
  href="https://example.service-now.com/incident/[INCIDENT_ID]" style="color: #1e40af;">[INCIDENT_ID]</a></li>
      <li style="margin-bottom: 6px;"><strong>Vendor tickets:</strong> #VND-88201, #VND-88456</li>
      <li style="margin-bottom: 6px;"><strong>Repository:</strong> <a
  href="https://github.example.com/org/acme-notification-service" style="color: #1e40af;">acme-notification-service</a></li>
      <li style="margin-bottom: 6px;"><strong>Runbook:</strong> <a href="https://wiki.example.com/runbooks/notification-delivery"
  style="color: #1e40af;">Notification Delivery Runbook</a></li>
      <li style="margin-bottom: 6px;"><strong>Dashboard:</strong> <a href="https://monitoring.example.com/dashboard/notifications"
  style="color: #1e40af;">Notification Error Rate Dashboard</a></li>
    </ul>

    <!-- FOOTER -->
    <hr style="border: none; border-top: 1px solid #d1d5db; margin: 24px 0 14px 0;">
    <p style="margin: 0 0 2px 0; font-size: 11px; color: #9ca3af;"><strong>Incident:</strong> [INCIDENT_ID] |
  <strong>Priority:</strong> P2 (escalated from P3) | <strong>Opened:</strong> [DD-Mon-YYYY] | <strong>Resolved:</strong>
  [DD-Mon-YYYY]</p>
    <p style="margin: 0 0 2px 0; font-size: 11px; color: #9ca3af;"><strong>Assignment Group:</strong> [team-name] |
  <strong>Assigned To:</strong> [Engineer Name]</p>
    <p style="margin: 0; font-size: 11px; color: #9ca3af;">Report generated: [DD-Mon-YYYY]</p>

  </div>
  </body>
  </html>
```
 ## Usage Examples for Beast Team

  ### Example 1: DPA Ultimate / Virtual Queue Vendor Issue

  [INCIDENT_ID] → INC0482901
  [Incident Title] → Virtual Queue Booking Failures
  [Vendor Name] → Lineberty
  [Service/feature] → Virtual Queue (HTC Meet & Greet)
  Affected flows → POST /api/v1/vq/book → 🔴 Affected, GET /api/v1/vq/status → ✅ Never affected

  ### Example 2: Mobile Order / Agilysys Integration

  [INCIDENT_ID] → INC0489124
  [Incident Title] → Mobile Order Payment Processing Timeout
  [Vendor Name] → Agilysys POS
  [Service/feature] → Mobile Order
  Affected flows → POST /mobile-order/v1/checkout → 🔴 Affected

  ### Example 3: Digital Key / Opera Cloud

  [INCIDENT_ID] → INC0475638
  [Incident Title] → Digital Key Activation Failures
  [Vendor Name] → Opera Cloud (OHIP)
  [Service/feature] → Digital Key
  Affected flows → POST /digital-key/v1/activate → 🔴 Affected

  ## Best Practices for Beast Squad

  1. **Fill all placeholders** — Never leave bracketed values in the final output
  2. **Use actual Splunk queries** — Replace example links with real Splunk dashboard URLs with FIXED time ranges
  3. **Include correlation IDs** — Add SWID, bookingId, confirmationNumber in the "Post-Fix Reports" section
  4. **Update status banner** — Change colors based on RESOLVED/MITIGATED/ACTIVE state
  5. **Link vendor tickets** — Include actual vendor support ticket numbers when available
  6. **Calculate percentages** — Error breakdown should add up to 100%
  7. **Add DLP-specific context:**
     - Affected BAPPs (BAPP0218964, BAPP0220148, etc.)
     - Market/property (DLP, WDW, DCL)
     - Guest vs Cast Member impact
     - Mobile vs Web platform breakdown

  ## DLP-Specific Placeholder Mappings

  | Generic Placeholder | DLP Context Example |
  |---------------------|---------------------|
  | `[Vendor Name]` | Lineberty, Agilysys, Opera Cloud, OneID, Galaxy, Docusign, TravelBox |
  | `[Service/feature]` | Virtual Queue, Digital Key, Mobile Order, Book Dine, DPA Ultimate, OLCI |
  | `[team-name]` | app-frdlp-digital-ext-support (Beast), app-frdlp-attraction-dge (Storm), app-frdlp-resort-dge (Cruz Ramirez) |  | `[regions/markets]` | Disneyland Paris, Walt Disney World, Disneyland Resort, Disney Cruise Line |
  | `[platform/provider]` | Mobile App (iOS/Android), Web (guest.disneylandparis.com), AWS API Gateway |

  ## Wrap for ServiceNow

  Always wrap the final HTML in `[code]...[/code]` tags for ServiceNow work notes compatibility:

```html
[code]
  <html>
  <body style="...">
  ...
  </body>
  </html>
[/code]
```