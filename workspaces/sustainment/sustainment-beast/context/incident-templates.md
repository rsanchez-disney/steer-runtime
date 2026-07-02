# 📋 Incident Templates & Structures

Templates for incident documentation, ServiceNow work notes, and stakeholder communication. Load this file when creating or closing incidents.

## analysis.md — 12-Section Structure

1. **Executive Summary** — One-paragraph overview of the issue and root cause; quick reference for stakeholders
2. **Incident Overview** — Short description and error message, first occurrence, frequency, scope, impact assessment
3. **Non-Technical Explanation** — Clear explanation for non-technical stakeholders: what the user experiences, why it happens, business impact
4. **Technical Deep Dive** — Detailed root cause, complete flow from trigger to error, specific code files/classes/methods/line numbers, validation gaps
5. **Reproduction Steps** — Numbered steps, required preconditions, expected vs. actual behavior
6. **Error Analysis** — Error logs, error codes, stack traces (reference `log-traces/`), correlation IDs
7. **Code References** — GitHub links, file paths, line numbers, related classes and methods
8. **Validation & Evidence** — Splunk queries, database queries, API test results, data samples (reference `payload-examples/`)
9. **Root Cause Summary** — Concise root cause statement, contributing factors, why existing validations didn't catch it
10. **Impact & Scope** — Affected users/transactions, business impact, environments, workarounds
11. **Recommended Solutions** — Short-term fixes, long-term solutions, specific code changes, testing recommendations
12. **Next Steps** — Immediate actions, follow-up investigations, preventive measures, documentation updates

## HTML Templates

All HTML reports MUST follow the Beast Template Generator format (see [Confluence page](https://mywiki.disney.com/spaces/SBH/pages/1280869030/Beast+Template+Generator)).

### Research Working Notes (for work notes during investigation)

```html
<div style="font-family: Calibri, sans-serif; font-size: 13px; border: 1px solid #d1d1d1; padding: 15px; border-radius: 5px; background-color: #fafafa; max-width: 700px;">
    <h2 style="color: #2980b9; border-bottom: 2px solid #2980b9; padding-bottom: 5px; margin-top: 0;">🔍 Research Working Notes</h2>

    <table style="width: 100%; margin-bottom: 15px; border-collapse: collapse;">
        <tr>
            <td style="width: 120px; font-weight: bold; padding: 4px 0;"><KEY>:</td>
            <td style="padding: 4px 0;"><VALUE></td>
        </tr>
        <!-- Repeat rows for: SWID, Confirmation Number, Booking ID, Market, Error Code, etc. -->
    </table>

    <div style="background-color: #fdeaea; border-left: 5px solid #e74c3c; padding: 10px; margin-bottom: 15px;">
        <b style="color: #c0392b;">🔴 Identified Error: <Error Title></b>
        <pre style="background: #ffffff; border: 1px solid #f5c6cb; padding: 8px; margin-top: 5px; overflow-x: auto; font-size: 11px;"><Error logs, URLs, response codes></pre>
    </div>

    <div style="background-color: #fff9e6; border-left: 5px solid #f1c40f; padding: 10px; margin-bottom: 15px;">
        <b style="color: #856404;">💡 Analysis: <Analysis Title></b>
        <pre style="background: #ffffff; border: 1px solid #ffeeba; padding: 8px; margin-top: 5px; overflow-x: auto; font-size: 11px;"><Technical analysis details></pre>
    </div>

    <h3 style="color: #2c3e50; margin-bottom: 10px;">🔗 Evidence & Logs</h3>
    <ul style="list-style-type: none; padding-left: 0; margin: 0;">
        <li style="margin-bottom: 8px;">
            🔹 <Link description> <a href="<URL>" target="_blank" style="color: #3498db; text-decoration: none;">[Link]</a>
        </li>
    </ul>
</div>
```

Sections:
- **General Data table**: Key-value pairs (SWID, Confirmation Number, Booking ID, Market, Error Code, etc.)
- **Error Details** (red box): Error title with 🔴 prefix, logs/URLs/response codes in `<pre>` block
- **Analysis** (yellow box): Analysis title with 💡 prefix, technical explanation in `<pre>` block
- **Evidence & Logs**: List of Splunk links, dashboards, or other evidence with 🔹 prefix

### Final Report (for closure / stakeholder communication)

```html
<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;padding:24px;background:#f7f7fb;">
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:14px">
        <h1 style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Short Description</h1>
        <div style="font-size:13px;"><Short description / interpretation of the incident></div>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:14px">
        <h2 style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Affected APPs</h2>
        <div style="font-size:13px;"><List of affected applications and flows></div>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:14px">
        <h2 style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Timeline</h2>
        <div style="font-size:12px;white-space:pre-wrap;"><Timeline of events: start time, duration, resolution></div>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:14px">
        <h2 style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Impact</h2>
        <div style="font-size:12px;white-space:pre-wrap;"><Impact description: affected guests, flows, business impact></div>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:14px">
        <h2 style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;">Root Cause</h2>
        <div style="font-size:12px;white-space:pre-wrap;"><Root cause analysis and description></div>
    </div>
</div>
```

Wrap all generated HTML in `[code]...[/code]` for ServiceNow work notes compatibility.

## Migration from Old Structure

If you encounter incidents with `incidente.md` and `result.md`:
- Consolidate both files into a single `analysis.md` following the 12-section structure
- Preserve all existing content and analysis
- Enhance with any missing sections
- Keep the old files for reference until confirmed the migration is complete
