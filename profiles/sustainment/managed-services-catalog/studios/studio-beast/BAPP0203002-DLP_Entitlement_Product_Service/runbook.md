# Runbook — DLP Entitlement Product Service

## Endpoints

| Environment | URL |
|-------------|-----|
| Prod | https://cme-eps-dlp.wdprapps.disney.com/api/product-finder |
| Stage | https://stage.cme-eps-dlp.wdprapps.disney.com/api/product-finder |
| Load | https://load.cme-eps-dlp.wdprapps.disney.com/api/product-finder |
| Latest | https://latest.cme-eps-dlp.wdprapps.disney.com/api/product-finder |

---

## Lambda Functions

| Environment | Function Name | Account | Trigger |
|-------------|--------------|---------|---------|
| Prod | epsdlp-euw1-prd-cme-eps-product-finder | 725065748993 | API Gateway |
| Stage | epsdlp-euw1-stg-cme-eps-product-finder | 564479547993 | API Gateway |
| Load | epsdlp-euw1-lod-cme-eps-product-finder | 564479547993 | API Gateway |
| Latest | epsdlp-euw1-lst-cme-eps-product-finder | 301080195839 | API Gateway |

---

## Monitoring

### Splunk
| Environment | Query |
|-------------|-------|
| Prod | `index=wdpr_dlp_cme source="eu-west-1:/aws/lambda/epsdlp-euw1-prd-cme-eps-product-finder:*"` |
| Stage | `index=wdpr_dlp_cme source="eu-west-1:/aws/lambda/epsdlp-euw1-stg-cme-eps-product-finder:*"` |
| Load | `index=wdpr_dlp_cme source="eu-west-1:/aws/lambda/epsdlp-euw1-lod-cme-eps-product-finder:*"` |
| Latest | `index=wdpr_dlp_cme source="eu-west-1:/aws/lambda/epsdlp-euw1-lst-cme-eps-product-finder:*"` |

---

## Restart Procedures

Lambda is serverless — no restart needed. If issues persist:
1. Check Lambda configuration in AWS Console
2. Verify API Gateway integration
3. Redeploy via GitLab CI/CD

**Validation:** Call product-finder endpoint with a known SKU.

---

## Scaling

- Lambda auto-scales. Adjust concurrency limits if needed (Cloud OPS).

## Rollback

- Redeploy previous version from GitLab: https://gitlab.disney.com/cgs-wdw/capacity-managed-events/cme-eps

## Contacts

| System | Contact | When to Engage |
|--------|---------|----------------|
| Lambda/Infrastructure | Cloud OPS | Function errors, scaling, permissions |
| Application logic | Luigi Squad (app-frdlp-guestprofile) | Code issues, data mapping |
| Product data | Content team (Tridion/CME Surqual) | Missing or incorrect product data |
