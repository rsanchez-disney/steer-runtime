# Runbook — DLP Ticket Linking Services

## ECS Service Details (Tickets Linking Provider)

| Environment | Cluster | Service |
|-------------|---------|---------|
| Prod | dlp-apps-S0001481-euw1-prd | tms-tickets-linking-provider-prod-live |
| Stage | dlp-apps-S0001481-euw1-stg | tms-tickets-linking-provider-stage-live |
| Load | dlp-apps-S0001481-euw1-lod | tms-tickets-linking-provider-load-live |
| Latest | dlp-apps-S0001481-euw1-lst | tms-tickets-linking-provider-latest-live |

## Park Entry BookingID Provider (On-Prem)

- **Location:** DLP Genie Datacenter (server vl-frmv-rhe***)
- **NOT deployed on AWS**

---

## Monitoring

### Splunk
| Component | PROD | Lowers |
|-----------|------|--------|
| Ticket Linking Provider | Technical Dashboard | Technical Dashboard |
| Park-Entry BookingID Provider | wdpr-dlp-is-guest-gxc-park-entry-ticket-bookingid-provider | Park-Entry BookingID Provider Dashboard |

### AppDynamics
| Component | PROD | Load | Stage |
|-----------|------|------|-------|
| Ticket Linking Provider | Dashboard | Dashboard | Dashboard |
| Park-Entry BookingID Provider | Application | Application | Application |

---

## Restart Procedures

### Tickets Linking Provider (ECS)
1. Access ECS cluster `dlp-apps-S0001481-euw1-prd` in eu-west-1
2. Force new deployment on service `tms-tickets-linking-provider-prod-live`

### Park Entry BookingID Provider (On-Prem)
- Restart on-prem service on server vl-frmv-rhe***

**Validation:** Check health endpoints (simple + deep) for both components.

---

## Swagger

- Park Entry BookingID Provider: https://dlp-microservice-stage.emea.wdpr.disney.com:8443/WDPR-DLP-IS/wdpr-dlp-is-guest-gxc-park-entry-ticket-bookingid-provider/swagger-ui/index.html

## Rollback

- Redeploy previous version via Harness (Ticket Linking Provider)
- Jenkins for Park Entry BookingID Provider

## Contacts

| System | Contact | When to Engage |
|--------|---------|----------------|
| ECS Infrastructure | Cloud OPS | Ticket Linking Provider service issues |
| On-prem infrastructure | On-prem ops | Park Entry BookingID Provider issues |
| Galaxy Database | Galaxy team | Stored procedure / data issues |
| Application logic | Luigi Squad (app-frdlp-guestprofile) | Code / business logic issues |
