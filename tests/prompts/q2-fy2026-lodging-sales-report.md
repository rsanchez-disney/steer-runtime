Generate the Q2 FY2026 Quarterly Report for Lodging Sales Distribution (January 1 – March 31, 2026).

For each studio, query Jira using these strategies:

**ROS studios** (Gamora, Nebula, Mantis, Bang, Yondu, Rocket, Star-Lord):
`project = ROS AND Studio = "{studio_name}" AND resolved >= "2026-01-01" AND resolved <= "2026-03-31"`

**TEP3 studios** (Cosmo, Terror):
`project = TEP3 AND Team = {team_id} AND resolved >= "2026-01-01" AND resolved <= "2026-03-31"`
- Cosmo: Team = 1988
- Terror: Team = 2261

**TRADE** (Gamora secondary):
`project = TRADE AND Studio = "TRADE - Gamora | Ruth" AND resolved >= "2026-01-01" AND resolved <= "2026-03-31"`

**CCS** (Forky):
`project = CCS AND resolved >= "2026-01-01" AND resolved <= "2026-03-31"`

For each studio, collect:
1. Epics/stories resolved in Q2
2. Sprint velocity from boards (use board IDs from workspace config)
3. Carry-over stories (status != Done at sprint end)

Then produce the full 10-section report per the quarterly template. For sections I need to provide input on (risks, roadmap, studio health), ask me before finalizing.
