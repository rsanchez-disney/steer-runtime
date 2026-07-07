# Troubleshooting — WDPR Ant-Man Assembler

## Common Issues

### Issue: Mobile D-Scribe Changes Not Flowing to Assembler/Transformer

**Symptoms:** Changes visible in query endpoint but not in transform endpoint; duplicate keys in JSON response cause value overwriting.

**Root Cause:** Duplicate "itemTitle" key in JSON response — last value overwrites first.

**Resolution:**
1. Identify the TCM ID (e.g., tcm:753-992386-1024)
2. Check CMS/Tridion for dirty data on that content item
3. Correct the duplicate key issue at the source

---

### Issue: Content Still Visible on Mobile After Successful Unpublish

**Symptoms:** Content visible on mobile despite successful unpublish; Watcher shows no content.

**Root Cause:** ARTU delete notification failed from Assembler; content documents still exist in Couchbase.

**Resolution:**
1. Manually delete remaining documents using:
   - Method: DELETE
   - URL: `https://realtime-pub.wdprapps.disney.com/content-publisher/content/{type};version={version}/{destination}/{entity-id}`
   - Required Headers: Authorization (BEARER token), accept-language, X-Data-Source (d-scribe), X-Conversation-Id, Content-Type (application/json), X-Data-Datetime
2. Example: `https://realtime-pub.wdprapps.disney.com/content-publisher/content/hub;version=1.0/wdw/festivals-hubs_festival-of-the-arts-food`

---

### Issue: UrlFriendly File Overwriting / Delete Issue

**Symptoms:** Watcher call doesn't return Page data after publish/unpublish.

**Root Cause:** Multiple pages share the same UrlFriendly ID; publishing overwrites the shared file; unpublishing deletes the shared file affecting all pages.

**Resolution:**
1. Call transform for entity: `/assembler/transform/Preview/Entity/{tcmId}` and check each page's urlFriendly
2. Indicate to requester that unique UrlFriendly must be generated for each page
3. Jira reference: https://disneyexperiences.atlassian.net/browse/GCX-15898

---

### Issue: CDN Vision DAM Access Denied

**Symptoms:** cdnVision shows "Access Denied" error.

**Root Cause:** authZ between DAM Lambda and Assembler was changed.

**Resolution:**
1. Check DAM Lambda last invocation: `wdpr-content-S0001431-usw2-prd-lst-vision-dam-auth-authz`
2. Splunk: `index=wdpr_d-scribe source="*dam*" source="*wdpr-content-S0001431-usw2-prd-lst-vision-dam-thatdamlambda*"`
3. Create an INC to Park's SE
4. Slack thread: https://disney.slack.com/archives/C025KAH9D3M/p1674057754918449
5. Example INC: INC22364877

---

### Issue: DamLambdaNotifier — DAM Lambda Failed with Status Code 500

**Symptoms:** Image not updated in DAM VISION S3 bucket.

**Resolution:**
1. Find the failed payload in Splunk
2. Call the DAM Vision copy endpoint manually:
   ```
   curl --location 'https://dscribe-vision-dam.wdprapps.disney.com/copy' \
   --header 'Authorization: BEARER $TOKEN' \
   --header 'Content-Type: application/json' \
   --data '{"cloudStorage":"s3","source":"https://author-p28055-e88807.adobeaemcloud.com/content/dam/...","destination":"/digital/parks-platform/..."}'
   ```

---

### Issue: Orphaned Dependencies in S3

**Symptoms:** Stale content files remain in S3 after unpublish; pages show outdated content.

**Root Cause:**
- URL-friendly ID or one-source ID changed without proper unpublish
- Cloned pages published with shared IDs temporarily
- Multiple pages share same IDs due to errors/conflicts

**Resolution:**
1. Manual removal of orphaned dependencies from S3
2. Validate publications; check S3 bucket for files with old URL-friendly ID
3. **Production Action:** Request Content Producer to validate and republish immediately to prevent page downtime

---

### Issue: How to Validate Publish Media-Service

**Steps:**
1. Find a MediaBundle in the respective environment Slack channel (d-scribe-publish-dev/latest/stage)
2. Find a MediaBundle with Transform and Content Link
3. Change "/transform/" to "/publish/" in the URL
4. Send GET request in Postman
5. Find "urlFriendlyId" in response body
6. Search Splunk: `index="*d*scribe*" "MediaServiceNotifier"` (last 15 minutes)
7. Verify logs contain the urlFriendlyId from the publish

---

## Escalation Decision Tree

- If content data issues (dirty TCM data) → escalate to CMS/Tridion team
- If CDN Vision DAM access denied → create INC to Park's SE
- If ARTU delete failures → check Couchbase manually, escalate to Ant-Man Dev
- If UrlFriendly conflicts → notify Content Producer to fix unique IDs
- If infrastructure/ECS issues → escalate to Cloud Platform team

## Known Quirks

- UrlFriendly IDs must be unique per page — shared IDs cause cascading publish/unpublish issues
- DAM Lambda (wdpr-content-S0001431-usw2-prd-lst-vision-dam-auth-authz) handles authZ for CDN Vision
- Shares `wdpr_d-scribe` Splunk index — filter by `source="*assembler-prod/*"` for production
- Content publish notifications go to Slack channels: d-scribe-publish-dev/latest/stage
- Configulator: https://latest.disneyworld.disney.go.com/debug/directories-explorer/?path=/application/configs/configulator.ini
