# Splunk services — Auth Manager

## Indexes

| Index                         | Scope      |
|-------------------------------|:----------:|
| deetech_ese_ba_nonprd_coreapi | Lower envs |
| deetech_ese_ba_prd_coreapi    | Production |

## Splunk URL

| Environment | URL                                                           |
|-------------|---------------------------------------------------------------|
| All         | https://deetech.splunk.disney.com/en-US/app/app_eseweb/search |

## Usage

When querying Splunk for Auth Manager services:

- Use `index=deetech_ese_ba_nonprd_coreapi` for dev, perf, and stg environments
- Use `index=deetech_ese_ba_prd_coreapi` for production
- All environments use the same Splunk URL
