# Troubleshooting — WDPR Ant-Man Assemblies Delivery

## Service Overview

Assemblies Delivery is a Python script that runs on Digital Platform UI servers (EC2 + ECS sidecar). It listens for SNS/SQS notifications when D-Scribe Assembler publishes content to S3, then copies that content to the local node filesystem.

- **Splunk:** `index="*assemblies*"`
- **Startup indicator:** `"main: listening for messages..."`
- **Log path (EC2):** `/var/log/monit/assemblies-delivery/assemblies-delivery.log`
- **Version check:** `/u01/assemblies-delivery/scripts/version`

---

## Common Issues

### Issue: Script Doesn't Start / Error Creating SQS

**Symptoms:** Script fails to start, SQS queue creation error in logs.

**Root Cause:** SQS statement in script was changed, queue creation fails due to mismatch with existing queue policy.

**Resolution:**
1. Ask SE to drop the queue using SQS console
2. Re-run the script: `sudo monit restart assemblies-delivery`
3. Verify startup: `sudo tail -f /var/log/monit/assemblies-delivery/assemblies-delivery.log`
4. Look for: `"main: listening for messages..."`

---

### Issue: Script Doesn't Start / Environment Not Found

**Symptoms:** Script fails with environment configuration error.

**Root Cause:** Configuration for current environment doesn't exist.

**Resolution:**
1. Check `environment.conf` file (provided by Chef)
2. Verify rules folder contains assemblies-rules files from Nexus
3. Check CSM (etcd) for correct environment configuration

---

### Issue: SQS Filling Up on AWS Console

**Symptoms:** Messages available for a node's SQS queue is non-zero.

**Root Cause:** Node may have been recycled, script not running on that node.

**Resolution:**
1. Check logs on that node using EC2 hostname from queue name
2. If node not found (recycled), the SQS queue needs manual removal from AWS Console
3. If node exists, restart the script: `sudo monit restart assemblies-delivery`

---

### Issue: Container Doesn't Start / ECR Permission Issues

**Symptoms:** ECS sidecar container fails to pull image from ECR.

**Root Cause:** Incorrect account permissions on ECR repo.

**Resolution:**
1. **Immediate:** Add missing account numbers to ECR permissions directly
   - ECR Console: https://us-west-2.console.aws.amazon.com/ecr/repositories/private/876496569223/wdpr-ecm/assemblies-delivery/_/permissions
2. **Validate:** Check CloudTrail for who updated permissions last
   - CloudTrail: https://us-west-2.console.aws.amazon.com/cloudtrailv2/home?region=us-west-2#/events?ResourceName=wdpr-ecm/assemblies-delivery
3. **Permanent:** Check with CICD to verify policy is no longer being set through pipeline

---

### Issue: Content Not Updating on UI Nodes

**Symptoms:** Published content not appearing on PEP/COM/Lodging/DCL sites.

**Resolution:**
1. Verify Assembler published successfully (check Assembler logs)
2. Check SNS topic received the notification: `arn:aws:sns:us-west-2:876496569223:d-scribe-ragnarok-publish-prod`
3. Check node's SQS queue for pending messages
4. Check assemblies-delivery log on the affected node
5. If script is not running: `sudo monit restart assemblies-delivery`

---

## Escalation Decision Tree

- SQS queue creation failure → ask SE to drop queue, restart script
- ECR permission issues → add account to ECR permissions, check with CICD
- Content not publishing → check Assembler (BAPP0089443) first, then SNS/SQS
- Node recycled with orphan SQS → manually remove queue from AWS Console
- Chef configuration issues → check CSM/etcd, escalate to Cloud SE
- Widespread content delivery failure → check S3 bucket access, escalate to Cloud Platform

## Known Quirks

- SQS queues are created dynamically per node (contain EC2 hostname in name)
- If SQS statement in script changes, ALL queues must be dropped and recreated
- Two deployment models: Chef EC2 (PEP, COM, Lodging, DCL) and ECS sidecar (Profile UI, Checkout UI)
- Artifact must be promoted through 'production' to be uploaded to WDPRT-master repo in Nexus3
- CSM (etcd) replaced direct etcd for configuration management
