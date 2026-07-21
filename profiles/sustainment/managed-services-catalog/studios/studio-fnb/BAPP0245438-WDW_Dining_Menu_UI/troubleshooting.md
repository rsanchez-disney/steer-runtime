# Troubleshooting — WDW Dining Menu UI

## Common Issues

### Issue: Menus not loading on website

**Symptoms:** disneyworld.disney.go.com menu pages show errors or blank

**Root Cause:** Lambda failure, API Gateway issue, or S3 deployment problem

**Resolution:**
1. Check API Gateway logs for 5xx errors (us-east-1)
2. Check Lambda CloudWatch logs: /aws/lambda/dinemenu-use1-prd-dinemenu
3. Verify S3 bucket has latest deployment: cgssre-wdpr-revmgmt-prod-use1-spa

---

## Escalation Decision Tree

- If Lambda/API Gateway → redeploy via GitLab pipeline
- If CDN → Akamai team
- If backend data → check Dining Menu Service (BAPP0089587)

## Known Quirks

- SPA + Lambda architecture — no ECS to restart
- Akamai may cache errors — may need cache purge
