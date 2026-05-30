# Business Rules — WDPR Ant-Man Assemblies Delivery

## Service Purpose

Assemblies Delivery is part of the Global Content Platform. It runs on Digital Platform UI servers and receives notifications when D-Scribe Assembler publishes content to S3. The script copies content from S3 to each server on which it runs. This is the replacement for the old Integrator and Configulator rsync service.

---

## Content Delivery Flow

1. D-Scribe Assembler publishes front-end content to S3 buckets
2. SNS notification sent to the relevant topic (per environment)
3. Each node's SQS queue (subscribed to SNS) receives the notification
4. Assemblies-Delivery script on each node picks up the message from SQS
5. Script copies the updated content from S3 to the local node filesystem

---

## Deployment Models

| Model | Platform | Nodes |
|-------|----------|-------|
| Chef EC2 (Lift-and-Shift) | PEP UI, COM UI, Lodging UI | mdx-aws-* nodes |
| Chef EC2 (Lift-and-Shift) | DCL Finder WAM, DCL Sales | dcl-aws-* nodes |
| ECS Sidecar | Profile UI | Docker container in ECS task |
| ECS Sidecar | Checkout UI | Docker container in ECS task |

---

## Dependencies

| Direction | Service | Relationship |
|-----------|---------|-------------|
| Upstream | Assembler (D-Scribe) | Generates and places front-end files in S3 |
| Upstream | S3 Buckets | Content storage (prod.integrator, etc.) |
| Upstream | SNS Topics | Publish notifications (d-scribe-ragnarok-publish-*) |
| Infrastructure | SQS | Per-node queues subscribed to SNS |
| Infrastructure | Chef/CSM | Configuration management for EC2 nodes |

---

## Downstream Dependents

| Service | Type | BAPP |
|---------|------|------|
| PEP UI | Lift-and-Shift EC2 | — |
| COM UI | Lift-and-Shift EC2 | — |
| Lodging UI | Lift-and-Shift EC2 | — |
| DCL Finder WAM | Lift-and-Shift EC2 | BAPP0054953 |
| DCL Sales | Lift-and-Shift EC2 | BAPP0054785 |
| Profile UI | ECS | — |
| Checkout UI | ECS | — |

---

## Impact Classification

- **Full outage:** Content updates stop reaching UI nodes — guest-facing sites serve stale content
- **Single node failure:** One node doesn't receive updates — other nodes in the pool still serve current content (load balancer routes around it)
- **SQS queue orphaned:** Recycled node leaves orphan queue — no impact but needs cleanup

---

## Key Constraints

- SQS queues are dynamically created per node (contain hostname)
- If SQS statement in script changes, existing queues must be dropped and recreated
- Artifact must be promoted through 'production' to upload to WDPRT-master in Nexus3
- CSM (etcd) is the configuration source — replaced direct etcd access
- Two separate Jenkins pipelines: one for EC2 artifact, one for ECS Docker image
