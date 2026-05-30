# Runbook — Vendomatic

## Service Details

| Field | Value |
|-------|-------|
| BAPP | BAPP0054821 |
| Runtime | PHP on Chef-managed EC2 |
| Database | MySQL |
| CI/CD | Jenkins: https://gam.cicd.wdprapps.disney.com/job/vendomatic/ |
| Repo | https://github.disney.com/wdprd-development/vendomatic |
| Chef | Cookbook: wdpro_mdx_stack, run_list: recipe[wdpro_mdx_stack::vendomatic-service] |

---

## Environment URLs

| Environment | URL | Chef Environment |
|-------------|-----|-----------------|
| prod | https://vendomatic.wdprapps.disney.com/index.php | — |
| stage | https://stage.vendomatic.wdprapps.disney.com/login.php | mdx-aws-stage |
| load | https://load.vendomatic.wdprapps.disney.com/login.php | mdx-aws-lt01 |
| latest | http://latest.vendomatic.wdprapps.disney.com/login.php | mdx-aws-latesta |

---

## Restart Procedures

1. SSH to the affected EC2 instance
2. Restart the PHP/Apache service
3. Verify the application is responding at the environment URL
4. Check Splunk for errors post-restart: `index=wdpr_vendomatic level=ERROR earliest=-15m`

---

## Deploy / Rollback

- **Deploy:** Jenkins pipeline auto-triggers after PR merge to `develop` branch
- **Rollback:** Redeploy previous version via Jenkins
- **Chef:** Changes to infrastructure config require Chef run on target nodes

---

## Monitoring

- **Splunk:** `index=wdpr_vendomatic`
- **AppDynamics:** disney-prod.saas.appdynamics.com (app=6, component=907)
- **Splunk Dashboard:** https://splunk.wdprapps.disney.com/en-US/app/launcher/lists_service_prod

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| On-Call | Rotation | +1 5707 347 639 Option 1 |
| Tech Lead | Rodrigo Duarte | Rodrigo.A.Duarte.-ND@disney.com |
| Manager | Frank Kenes | 708-712-8443 |
| Teams Channel | GCx Help Ant-Man Help | @gcx_antman |
