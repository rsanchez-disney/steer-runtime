# jenkins-config — Architecture Guide

## Overview

**Repository:** `wdpro-automation/jenkins-config`
**Host:** github.disney.com
**Stack:** Jenkins Job DSL (Groovy)
**Scale:** 538 groovy files → 506 jobs
**Jenkins URL:** http://stage.jenkins-main-digitalqe.wdprapps.disney.com

## Directory Structure

```
jenkins-config/
├── commerce-automation/             # Main folder — most jobs live here
│   ├── presales/
│   │   ├── studio-kaos/            # KAOS — tickets sustainment, mods, special events (~30 jobs)
│   │   ├── studio-control/         # CONTROL — Tickets SPA sustainment (~9 jobs)
│   │   └── tcc-lexvas/             # LexVAS sanity (~4 jobs)
│   ├── cme/                        # CME — sanity, blockout, castflow, GSS (~16 jobs)
│   ├── express-checkout/           # EC sustainment, booking/cart services (~15 jobs)
│   ├── dine/                       # Dine — backend, digital, mobile, web (~100 jobs)
│   ├── eec/                        # EEC — regressions, sanity, e2e (~13 jobs)
│   ├── unified-checkout/           # UC — affiliates, mods, packages, tickets (~40 jobs)
│   ├── ui-dvic/                    # DVIC — visual validation, MagnifAI (~18 jobs)
│   ├── annual-passes/              # AP — upgrades delivery (~16 jobs)
│   ├── mobile-smokes/              # Mobile smoke tests (~24 jobs)
│   ├── lodging_uce/web/            # Lodging UCE (~40 jobs)
│   ├── dine-card/                  # Dine card (~8 jobs)
│   ├── tpt_wpt_se_mm/web/         # TPT/WPT/SE/MM (~2 jobs)
│   ├── development-pipeline/       # Dev sanity jobs (~6 jobs)
│   ├── peach/                      # Peach — tickets mods/sales (~6 jobs)
│   └── offers-automation/          # Offer improvements (~2 jobs)
├── Tep3/                           # TEP3 — cart, checkout, tickets-svc (~24 jobs)
├── dlrdrp/                         # DLR DRP — cart_ui, checkout_ui (~4 jobs)
├── helpers/
│   ├── JobHelper.groovy            # Web job parameters, Xray import, Slack, folders
│   ├── JobHelperMobile.groovy      # Mobile job parameters (iOS/Android, SauceLabs)
│   └── src/
│       ├── MobileConstants.groovy  # Device names, platform versions, app filenames
│       └── ParameterDescriptions.groovy  # Shared parameter descriptions
└── script_bash_*                   # Executor shell scripts
```

## Job DSL Pattern

Every groovy file follows this structure:

```groovy
import helpers.JobHelper

foldersPath = "commerce-automation/{area}/{sub}"
JobHelper.createNestDirectories(this, foldersPath, description)

job("${foldersPath}/{job-name}") {
    parameters(JobHelper.getWebJobParameters(brand, environment))
    triggers { cron('...') }
    wrappers { credentialsBinding { ... } }
    steps { shell(readFileFromWorkspace('script_bash_*')) }
    publishers { allure { ... } }
}
```

### Required Structure

| Section | Required | Purpose |
|---------|----------|---------|
| `import helpers.JobHelper` | ✅ | Always use helpers |
| `foldersPath` | ✅ | Job location in Jenkins |
| `createNestDirectories` | ✅ | Create folder structure |
| `parameters(...)` | ✅ | Use `JobHelper.getWebJobParameters()` or `JobHelperMobile` |
| `triggers` | Optional | Cron schedule |
| `wrappers` | Optional | Credentials, timeouts |
| `steps` | ✅ | Must reference `readFileFromWorkspace('script_bash_*')` |
| `publishers` | ✅ | Allure report generation |

## Helper Classes

### JobHelper.groovy

Provides standard web job infrastructure:

| Method | Purpose |
|--------|---------|
| `getWebJobParameters(brand, env)` | Standard web params: BROWSER, ENV, BRAND, ONE_ID, etc. |
| `createNestDirectories(context, path, desc)` | Create Jenkins folder hierarchy |
| `getXrayImportPublisher(...)` | Xray results upload |
| `getSlackNotification(...)` | Slack webhook notification |
| `getCsvUploadParams()` | CSV upload parameters |

### JobHelperMobile.groovy

Extends for mobile testing:

| Additional Params | Purpose |
|-------------------|---------|
| `SAUCE_LABS_APPIUM_VERSION` | Appium version for SauceLabs |
| `{PLATFORM}_DEVICE_NAME` | iOS/Android device |
| `{PLATFORM}_PLATFORM_VERSION` | OS version |
| `MOBILE_APP_FILENAME` | App binary filename |

## Common Parameters (Web)

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `BROWSER` | Choice | chrome | Browser selection |
| `RUNNING_ON_SAUCE_LABS` | Choice | true | Remote vs local |
| `ENV` | Choice | (per job) | Test environment |
| `BRAND` | Choice | (per job) | Brand under test |
| `ONE_ID` | Choice | true | OneID auth enabled |
| `ONE_ID_EDNA` | Choice | true | EDNA variant |
| `MAGNIFAI` | Choice | true | Visual validation (only MagnifAI jobs) |

## Executor Scripts

| Script | Purpose |
|--------|---------|
| `script_bash_directory_executor_web_uv` | Main web test executor (UV-based) |
| `script_bash_multiple_brand_executor_web_uv` | Multi-brand web executor |
| `script_bash_e2e_brand_executor_web_uv` | E2E brand executor |
| `script_bash_directory_executor_mobile_uv` | Mobile test executor |
| `script_bash_multiple_brand_executor_mobile_uv` | Multi-brand mobile executor |
| `script_allure_reporter_uv` | Allure report generation |
| `script_post_behave_allure_to_xray_uv` | Xray results import |
| `send_allure_summary_uv` | Allure summary notification |
| `script_teams_http_reporter` | Teams webhook notification |

## Post-Build Pipeline

Every job follows this post-build sequence:
1. **Allure report** — generates HTML report from `allure-results/`
2. **Xray import** — uploads results to Jira Xray
3. **Teams notification** — sends summary to Teams channel
4. **Workspace cleanup** — removes build artifacts

## Naming Conventions

- **Jenkins job names:** hyphens (`mods-dlr-latest`)
- **Groovy filenames:** underscores (`mods_dlr_latest.groovy`)
- **Job full path:** slashes (`commerce-automation/presales/studio-kaos/mods/web/mods-dlr-latest`)

## Key Files to Watch

| File | Impact | Why |
|------|--------|-----|
| `helpers/JobHelper.groovy` | CRITICAL | Changes affect ALL web jobs |
| `helpers/JobHelperMobile.groovy` | CRITICAL | Changes affect ALL mobile jobs |
| `helpers/src/MobileConstants.groovy` | HIGH | Device/app config for mobile |
| `script_bash_*` | HIGH | Executor scripts — affect job runtime |
| Any `*_executor_*` script | HIGH | Changes affect how tests run |
