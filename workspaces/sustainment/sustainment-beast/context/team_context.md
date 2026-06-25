# Beast Team — Project Context

## Team Members & Roles

| Member | Country | Shift | Role / Focus Area |
|--------|---------|-------|-------------------|
| Daniela Hernandez | MEX | LATAM | Team Lead / Scrum Master, sprint planning, daily reports |
| Mariela Visintin | ARG | LATAM | QA Lead / Scrum Master, sprint planning, daily reports |
| Olivia Latzke | ARG | LATAM | PM / Scrum Master, sprint planning, daily reports |
| Andres Calvo | COL | LATAM | Sr Software Engineer, backend, sustainment, AI tooling, incident mgmt |
| Sergio Arean | ARG | LATAM | Software Engineer, backend, sustainment, incident research, deployments |
| Leonidas Ramirez | COL | LATAM | Software Engineer, backend, deployments, DSR, Splunk, CHGs |
| Cristian Lopez | COL | LATAM | Software Engineer, support, incident coordination |
| David Herrera | COL | LATAM | Software Engineer |
| Jonathan Lopez Perez | COL | LATAM | QA |
| Pravin Dake | IND | INDIA | Software Engineer |
| Edmund Nietes | PHI | PHI | Software Engineer, overnight support, incident handling |
| Kenneth Suarez | PHI | PHI | Software Engineer, incident analysis |
| Ian Enriquez E. | PHI | PHI | Software Engineer, mobile app setup |

## Shifts

| Shift | Local Hours | UTC |
|-------|-------------|-----|
| LATAM | 09:00–17:30 ARG / 07:00–15:30 COL / 06:00–14:30 MEX | 12:00–20:30 UTC |
| INDIA | 09:30–18:30 IST | 04:00–13:00 UTC |
| PHI (Philippines) | 09:00–18:00 PHT | 01:00–10:00 UTC |

- Handover between shifts via Teams channel "🏠 All shifts"
- Shift coverage is ~24h: PHI → INDIA → LATAM → PHI

## Jira Configuration

| Parameter | Value |
|-----------|-------|
| Project | APP (DLP Guest Mobile App) |
| Board | Beast Squad (ID: 468, Scrum) |
| Board prefix | APP- |
| Sprint cadence | 2 weeks (10 business days) |
| PI (Program Increment) | 5 sprints per PI |
| Sprint naming | `APP - Iteration {PI}.{sprint_number}` |

### Jira Contacts (emails)

| Role | Email |
|------|-------|
| Tech Lead | Daniela.Hernandez.-ND@disney.com |
| QA Lead | Mariela.X.Visintin.-ND@disney.com |
| PM | Olivia.Latzke.-ND@disney.com |

**Dev Assignees:**
- Andres.Calvo.-ND@disney.com
- Sergio.Arean.-ND@disney.com
- Leonidas.Ramirez.-ND@disney.com
- Cristian.Camilo.Lopez.Martinez.-ND@disney.com
- David.Herrera.-ND@disney.com
- Pravin.Dake.-ND@disney.com
- Edmund.Nietes.-ND@disney.com
- Kenneth.Suarez.-ND@disney.com
- Ian.P.Enriquez.Ejercito.-ND@disney.com

**QA Assignees:**
- Jonathan.Lopez.Perez.-ND@disney.com

### Usage Notes

When querying Jira for this team, use:
- **Project filter:** "Guest Mobile App"
- **Board filter:** "Beast Squad"
- **Dev filter:** assignee in (Andres.Calvo.-ND@disney.com, Sergio.Arean.-ND@disney.com,
Leonidas.Ramirez.-ND@disney.com, Cristian.Camilo.Lopez.Martinez.-ND@disney.com, David.Herrera.-ND@disney.com,
Pravin.Dake.-ND@disney.com, Edmund.Nietes.-ND@disney.com, Kenneth.Suarez.-ND@disney.com,
Ian.P.Enriquez.Ejercito.-ND@disney.com)
- **QA filter:** assignee in (Jonathan.Lopez.Perez.-ND@disney.com)

## Common Issue Types

| Type | Description |
|------|-------------|
| Task | General work items, sustainment, deployments |
| Enabler Story | Technical enablers (SDK, foundation, infrastructure) |
| Dev Task | Development tasks |
| Test Task | Testing/validation tasks |
| Bug Prod | Production bugs |
| Defect | Non-production defects |

## Common Labels & Prefixes

| Label | Usage |
|-------|-------|
| `[Sustainment]` | Operational/maintenance work |
| `[Monitoring]` | Alert analysis and monitoring tasks |
| `[Postmortem]` | Incident post-mortem analysis |
| `[research]` | Investigation tasks linked to incidents |
| `[DSR]` | Data Subject Requests (GDPR) |
| `[Storm]` | Storm squad related (backend microservices) |
| `[SDK - OneID]` | OneID JWT migration tasks |
| `[PROD]` / `[LOWER]` | Environment-specific tasks |

## Enablers / Epics Routing

| Work Type | Target |
|-----------|--------|
| Sustainment tasks | Sustainment enabler in current PI |
| Incident research | Sustainment enabler, linked to INC number |
| Deployments/CHGs | Release management enabler |
| SDK/Foundation | Technical enabler for the specific initiative |

## Capacity Parameters

| Parameter | Value |
|-----------|-------|
| Hours per day | 8 total, ~6.5 productive |
| Days off | At least 1 per sprint |
| Hours per Story Point | 6–8 hrs (when SP are used) |

### Daily Operational Overhead

| Activity | Time |
|----------|------|
| Incident review (ServiceNow) | 1.5 hrs/day |
| Monitoring alerts | 8 hrs/day, 1 day/week (rotates) |
| Scrum ceremonies | ~2 hrs/week |
| Shift handover | ~30 min/day |

## Applications (34)

| BAPP ID | Application |
|---------|-------------|
| BAPP0165730 | DLP Mobile App |
| BAPP0177675 | DLP Guest CRM Event Publisher |
| BAPP0177699 | DLP Keyring |
| BAPP0177719 | DLP Guest Extended Profile |
| BAPP0177763 | DLP Mobile API Gateway |
| BAPP0201208 | DLP Ticket Management Service |
| BAPP0201228 | DLP - Ticket Management Service Database |
| BAPP0203002 | DLP Entitlement Product Service |
| BAPP0203964 | DLP Ticket Linking Services |
| BAPP0211386 | DLP OLCI |
| BAPP0214896 | DLP API DGE.BOOK DINE |
| BAPP0215510 | DLP DGE API.BIO Services |
| BAPP0215510 | DLP DGE API BIO Services |
| BAPP0218964 | DLP DGE API.ORION services |
| BAPP0220148 | DLP DGE API.DigitalKey |
| BAPP0220648 | DLP DGE API.MeetAndGreet |
| BAPP0225827 | DLP Notification Service |
| BAPP0229487 | DLP DGE API.Mobile Order |
| BAPP0243155 | DLP Mission Control (Virtual queue) |
| BAPP0243936 | DLP Disney Premier Access Ultimate |
| BAPP0244328 | DLP Wallet Server Proxy Provider |
| BAPP0245900 | DLP Mobile BFF CORE |
| BAPP0247135 | DLP DGE API.MAPS Services |
| BAPP0247141 | DLP DGE API.Magic Mobile Ticket Meal Plan |
| BAPP0247844 | DLP DGE API.Guest Activity Block |
| BAPP0248634 | DLP Guest Membership Provider |


## ServiceNow

- **Assignment group(s):** app-frdlp-digital-ext-support