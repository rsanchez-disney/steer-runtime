# Troubleshooting — Vendomatic

## Service Overview

Vendomatic is a PHP application on Chef-managed EC2 that manages toggles, configuration data, and glue text for WDW, DLR, and HKDL sites. Data is stored in MySQL and served to consumers via List Service REST endpoints.

- **Splunk:** `index=wdpr_vendomatic`
- **Prod URL:** https://vendomatic.wdprapps.disney.com/index.php
- **AppDynamics:** disney-prod.saas.appdynamics.com (app=6, component=907)

---

## Common Issues

### Issue: Wrong Email Database

**Symptoms:** Vendomatic sending notifications to wrong recipients or using stale email data.

**Resolution:**
1. Verify the MySQL database connection is pointing to the correct environment
2. Check environment configuration in Chef
3. Confirm no recent Chef run changed the database endpoint

---

### Issue: Permission Errors

**Symptoms:** Users can log in but cannot edit configurations or glue text.

**Resolution:**
1. Verify user role assignments in Vendomatic admin
2. Check if the user's permissions were recently changed
3. Splunk: `index=wdpr_vendomatic "permission" OR "unauthorized" "<username>"`

---

### Issue: Debug Mode / Verbose Logging

**Symptoms:** Need to enable debug logging for troubleshooting.

**Resolution:**
1. Enable debug mode via application configuration
2. Monitor Splunk for detailed output: `index=wdpr_vendomatic "DEBUG"`
3. Remember to disable debug mode after troubleshooting

---

### Issue: Configuration Changes Not Reflected in List Service

**Symptoms:** Changes made in Vendomatic UI not appearing in List Service responses.

**Root Cause:** RabbitMQ notification not sent or List Service not processing the change.

**Resolution:**
1. Verify the change was saved in MySQL
2. Check RabbitMQ for pending messages to List Service
3. Check List Service logs: `index=wdpr_lists_service "vendomatic"`
4. If RabbitMQ is down, List Service won't receive notifications

---

## Escalation Decision Tree

- Auth/login issues → check Keystone service, escalate to identity team if down
- Database connectivity → escalate to DBA team
- Configuration not propagating → check RabbitMQ, then List Service (BAPP0012686)
- Chef deployment issues → check Chef server, escalate to Cloud SE
- Application bug → escalate to Ant-Man Dev team

## Known Quirks

- Legacy PHP application — no automated regression testing
- Splunk index is `wdpr_vendomatic` (NOT `wdpr_d-scribe`)
- Changes propagate to consumers via List Service + RabbitMQ (not direct)
- Desktop application exists for managing glue text resource bundles separately
