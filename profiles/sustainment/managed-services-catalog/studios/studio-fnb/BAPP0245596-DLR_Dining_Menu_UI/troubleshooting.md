# Troubleshooting — DLR Dining Menu UI

## Common Issues

### Issue: Menus not loading on website

**Symptoms:** disneyland.disney.go.com menu pages show errors

**Root Cause:** Lambda failure, API Gateway issue, or S3 deployment

**Resolution:**
1. Check API Gateway logs (us-west-2)
2. Check Lambda CloudWatch logs: /aws/lambda/dinemenu-usw2-prd-dinemenu
3. Verify S3 bucket: cgssre-wdpr-revmgmt-prod-usw2-spa

---

## Escalation Decision Tree

- If Lambda → redeploy via GitLab
- If CDN → Akamai team

## Known Quirks

- Same codebase as WDW, deployed to us-west-2
