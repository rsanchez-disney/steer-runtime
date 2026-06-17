# Runbook — DLP DGE API.DigitalKey

## CISA Server Health Checks

| Server | URL |
|--------|-----|
| DCR | https://dlp-cisa-e-server-dcr.emea.wdpr.disney.com/ |
| NY | https://dlp-cisa-e-server-ny.emea.wdpr.disney.com/ |
| DL | https://dlp-cisa-e-server-dl.emea.wdpr.disney.com/ |

---

## Opera Cloud

- **URL:** https://dlpce2ua.oraclehospitality.eu-frankfurt-1.ocs.oraclecloud.com/DLPFR2/operacloud/faces/opera-cloud-index/OperaCloud
- Select hotel of reservation
- Add `%` prefix to booking number in Confirmation field

---

## Monitoring

### CloudWatch
- DLP Mobile App Dashboard

---

## Digital Key Activation Steps (Opera)

1. Verify Magic Mobile feature flag is ON
2. Assign room
3. Assign groups: DK and OLC
4. Click "I want to..." → assign room keys
5. Click "Cut New Key" → select all Key Options → select Key Encoder Location → "Create Key"
6. Click "Check-in" and complete process

---

## Restart Procedures

1. Access ECS cluster `dlp-apps-S0001481-euw1-prd` in eu-west-1
2. Force new deployment on Digital Key Provider service

**Validation:** Check health endpoint and CloudWatch dashboard.

---

## Rollback

- Redeploy previous version via Harness CI/CD

## Contacts

| System | Contact | When to Engage |
|--------|---------|----------------|
| CISA Electronic Locks | CISA/infrastructure team | Server outage, lock communication failures |
| Opera Cloud | Opera support | Reservation validation, Magic Mobile flag issues |
| Digital Key Provider | Cruz Ramirez Resort DGE (app-frdlp-resort-dge) | Application logic issues |
| Push Notifications | Push Notification Publisher team | Arrival day notification failures |
| Cloud OPS | ops-frdlp-cloudops | ECS/infrastructure issues |
