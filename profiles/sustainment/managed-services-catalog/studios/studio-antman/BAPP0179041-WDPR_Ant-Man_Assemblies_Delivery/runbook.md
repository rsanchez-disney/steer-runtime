# Runbook — WDPR Ant-Man Assemblies Delivery

## Service Details

| Field | Value |
|-------|-------|
| BAPP | BAPP0179041 |
| Runtime | Python |
| Infra | Chef-managed EC2 + ECS sidecar container |
| AWS Account | 876496569223 (wdpr-apps), us-west-2 |
| Jenkins (EC2) | https://gam.cicd.wdprapps.disney.com/job/assemblies-delivery/ |
| Jenkins (ECS) | https://pipeline.disney.network/job/WDPR-ECM/job/assemblies-delivery/ |
| Repo | https://github.disney.com/WDPR-ECM/assemblies-delivery |
| Chef Cookbook | https://github.disney.com/se-wdpro-cookbooks/wdpr_assemblies_delivery |
| ECR | 876496569223.dkr.ecr.us-west-2.amazonaws.com/wdpr-ecm/assemblies-delivery |
| Nexus | https://nexus3.disney.com/repository/WDPRT-master/ |

---

## Nodes (EC2 Lift-and-Shift)

| Platform | Prod | Stage | Load | Latest |
|----------|------|-------|------|--------|
| MDX (PEP/COM/Lodging) | mdx-aws-proda, mdx-aws-prodb | mdx-aws-stagea, mdx-aws-stageb | mdx-aws-lt01 | mdx-aws-latesta, mdx-aws-latestb |
| DCL (Finder/Sales) | dcl-aws-proda, dcl-aws-prodb | dcl-aws-stagea, dcl-aws-stagebb | dcl-aws-lt01 | dcl-aws-latesta, dcl-aws-latestb |

## ECS Sidecar Deployments

- Profile UI — sidecar container in each ECS task
- Checkout UI — sidecar container in each ECS task

---

## S3 Buckets

| Environment | Bucket |
|-------------|--------|
| prod | prod.integrator |
| prodc | prodc.integrator |
| stage | stage.integrator |
| load | lt.integrator |
| latest | latest.integrator |

---

## SNS Topics

| Environment | ARN |
|-------------|-----|
| prod | arn:aws:sns:us-west-2:876496569223:d-scribe-ragnarok-publish-prod |
| prodc | arn:aws:sns:us-west-2:876496569223:d-scribe-ragnarok-publish-prodc |
| stage | arn:aws:sns:us-west-2:876496569223:d-scribe-ragnarok-publish-stage |
| load | arn:aws:sns:us-west-2:876496569223:d-scribe-ragnarok-publish-load |
| latest | arn:aws:sns:us-west-2:876496569223:d-scribe-ragnarok-publish-latest |

---

## Restart Procedures

**EC2 nodes:**
```bash
sudo monit restart assemblies-delivery
sudo tail -f /var/log/monit/assemblies-delivery/assemblies-delivery.log
# Look for: "main: listening for messages..."
```

**Version check:**
```bash
/u01/assemblies-delivery/scripts/version
```

---

## Deploy / Rollback (Script Update via CSM/etcd)

1. Go to application path in CSM etcd to check current values
2. Edit version values for vars `assembliesdelivery-script` and `assembliesdelivery-version`
3. Set `forceDeploy-ad*` vars to `true` (forceDeploy-ad for all, forceDeploy-ad-script for script only)
4. Run chef-client on nodes or wait for standard time
5. Review chef-client output for success
6. Check version at `/u01/assemblies-delivery/scripts/version`
7. Set `forceDeploy-ad*` values back to `false`

**CSM example:** https://csm.wdprapps.disney.com/keys/etcd-nap7-prod/deploy/lodging_ui_php/mdx-aws-latesta/instance-0

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| On-Call | Rotation | +1 5707 347 639 Option 1 |
| Tech Lead | Rodrigo Duarte | Rodrigo.A.Duarte.-ND@disney.com |
| Manager | Frank Kenes | 708-712-8443 |
| Teams Channel | GCx Help Ant-Man Help | @gcx_antman |
| Upstream (Assembler) | app-global-Bedrock | #gcx-help-bedrock |
