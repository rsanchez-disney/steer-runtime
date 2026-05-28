# dps-core-scoreschemeconfig — Endpoints

## Base Path
`/v1`

## API Endpoints

- `GET /v1/scoring-config/score-scheme — List schemes`
- `GET /v1/scoring-config/score-scheme/{name}/versions/{ver} — Get version`
- `POST /v1/scoring-config/score-scheme/{name}/versions/{ver}/activate — Activate`
- `POST /v1/scoring-config/score-scheme/{name}/lock — Lock scheme`
- `GET /v2/scoring-dimensions — List dimensions`
- `GET /v2/filters — List filters`
- `GET /v2/preferences — List preferences`
- `POST /v1/scoring-config/snapshots/{id}/promote — Promote snapshot`

## Health Check
- `GET /actuator/health`
