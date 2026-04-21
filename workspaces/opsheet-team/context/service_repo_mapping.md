# Service to Repository Mapping

Source: [Confluence — Service to Repository Mapping](https://mywiki.disney.com/pages/viewpage.action?spaceKey=OPSHEET&title=Service+to+Repository+Mapping)

All repos under `wdpr-parkops-opsheet-suite` on `github.disney.com`.

| #  | Service Name                          | Repo Name                                | Language       | Deployment     |
|----|---------------------------------------|------------------------------------------|----------------|----------------|
| 1  | opsheetoutservice (Deprecated)        | opsheet-out-service                      | Node.js        | Docker Fargate |
| 2  | opsheetprocessreportingnewrelic       | opsheet-process-reporting-newrelic       | Go 1.23.x      | AWS Lambda     |
| 3  | opsheetprocessentitypromotion         | opsheet-process-entity-promotion         | Go 1.23.x      | AWS Lambda     |
| 4  | opsheetprocesssnappcounts             | opsheet-process-snapp-counts             | Go 1.23.x      | AWS Lambda     |
| 5  | opsheetprocessdataimportgateforecast  | opsheet-process-dataimport-gateforecast  | Go 1.23.x      | AWS Lambda     |
| 6  | opsheetprocessdscribe                 | opsheet-process-dscribe                  | Go 1.23.x      | AWS Lambda     |
| 7  | opsheetprocessemails                  | opsheet-process-emails                   | Go 1.23.x      | AWS Lambda     |
| 8  | opsheetprocessgalaxycounts            | opsheet-process-galaxy-counts            | Go 1.23.x      | AWS Lambda     |
| 9  | opsheetprocessaccessrequestexpire     | opsheet-process-access-request-expire    | Go 1.23.x      | AWS Lambda     |
| 10 | opsheetprocesssystemevent             | opsheet-process-system-event             | Go 1.23.x      | AWS Lambda     |
| 11 | opsheetprocessuserupdate              | opsheet-process-user-update              | Go 1.23.x      | AWS Lambda     |
| 12 | opsheetprocesspurge                   | opsheet-process-purge                    | Go 1.23.x      | AWS Lambda     |
| 13 | opsheetapiguestcountingest            | opshin-api-guestcount-ingest             | Go 1.23.x      | AWS Lambda ALB |
| 14 | opsheetsnappingest                    | opshin-snapp-ingest                      | Go 1.23.x      | AWS Lambda ALB |
| 15 | opsheetbigproxyservice                | big-proxy-service                        | TypeScript     | AWS Lambda     |
| 16 | opsheetcountspolling                  | counts-polling-go                        | Go 1.23.x      | Docker         |
| 17 | opsheetgalaxyingest                   | opshin-galaxy-ingest                     | Go 1.23.x      | AWS Lambda ALB |
| 18 | opsheetwebserver                      | opsheet-plus-web-server                  | Go             | AWS Fargate    |
| 19 | opsheetconfigservice                  | configuration-service-go                 | Go 1.23.x      | AWS Lambda     |
| 20 | opsheetcountsforecastservice          | counts-forecast-service-go               | Go 1.23.x      | AWS Lambda     |
| 21 | opsheetdispatch                       | dispatch-service-go                      | Go 1.23.x      | AWS Lambda     |
| 22 | opsheetschedule (Deprecated)          | schedule-service-go                      | Go 1.23.x      | AWS Lambda     |
| 23 | entityservice                         | facility-service-go                      | Go 1.23.x      | AWS Lambda     |
| 24 | opsheetcloudwatchlogsingest           | opsheet-cloudwatch-log-ingest            | TypeScript     | AWS Lambda     |
| 25 | opsheethistoryingest                  | opshin-history-ingest                    | Go 1.23.x      | AWS Lambda ALB |
| 26 | opsheetvaultservice (Deprecated)      | opsheet-vault-go                         | Go 1.23.x      | AWS Lambda     |
| 27 | opsheetlegacyschedulesprocess         | opsheet-process-legacyschedules          | Go 1.23.x      | AWS Lambda     |
| 28 | opsheetschedulesemitservice           | schedules-monorepo-go                    | Go 1.23.x      | AWS Lambda     |
| 29 | opsheetschedulesapiservice            | schedules-monorepo-go                    | Go 1.23.x      | AWS Lambda     |
| 30 | opsheetschedulesprocessservice        | schedules-monorepo-go                    | Go 1.23.x      | AWS Lambda     |
| 31 | opsheetplusreportingemitter           | reporting-emitter-go                     | Go 1.23.x      | AWS Lambda     |
| 32 | opsheetdatasnapshot                   | data-snapshot-service-go                 | Go 1.23.x      | AWS Lambda     |
| 33 | opsheetlaneservice                    | lane-service-go                          | Go 1.23.x      | AWS Lambda     |
| 34 | opsheetguestcountprocess              | opsheet-process-guestcount               | Go 1.23.x      | AWS Lambda     |
| 35 | opsheetcronschedule                   | opshin-cron-schedule                     | Go 1.23.x      | AWS Lambda ALB |
| 36 | opsheetdispatchingest2                | opshin-dispatch-ingest                   | Go 1.23.x      | AWS Lambda ALB |
| 37 | opsheetdispatchprocess                | opsheet-process-dispatch                 | Go 1.23.x      | AWS Lambda     |
| 38 | opsheetcountsbucket                   | counts-bucket-go                         | Go 1.23.x      | AWS Lambda     |
| 39 | opsheettranslation                    | translation-service-go                   | Go 1.23.x      | AWS Lambda     |
| 40 | opsheetsargingest                     | opshin-sarg-ingest                       | Go 1.23.x      | AWS Lambda ALB |
| 41 | opsheetcountssummarization            | counts-summarization-go                  | Go 1.23.x      | AWS Lambda     |
| 42 | opsheetlegacyreportingemitter         | reporting-legacy-emitter-go              | Go 1.23.x      | AWS Lambda     |
| 43 | opsheetoccupancyservicego             | occupancy-service-go                     | Go 1.23.x      | AWS Lambda     |
| 44 | opsheetvasapi                         | opsheet-plus-vas                         | Node/TypeScript | Docker Fargate |
| 45 | opsheetcountsservice                  | counts-service-go                        | Go 1.23.x      | AWS Lambda     |
| 46 | opshinedhingest                       | opshin-edh-ingest                        | Go 1.23.x      | AWS Lambda ALB |
| 47 | opsheettestutilityservice             | test-utility-service                     | Go 1.23.x      | AWS Lambda     |
| 49 | opsheetsystemannouncement             | system-announcement-service-go           | Go 1.23.x      | AWS Lambda     |
| 50 | opsheetusermgmt                       | user-management-service-go               | Go 1.23.x      | AWS Lambda     |
| 51 | opsheetdataimport                     | ops-data-import-go                       | Go 1.23.x      | AWS Lambda     |
| 52 | opsheetglobalcounter                  | global-counter-service-go                | Go 1.23.x      | AWS Lambda     |
| 53 | opsheetguestcountsingestz             | zPOC-opshin-guestcounts-ingest           | Go 1.23.x      | AWS Lambda ALB |
| 54 | opsheetcronoccupancy                  | opshin-cron-occupancy                    | Go 1.23.x      | AWS Lambda ALB |
| 55 | opsheethistory                        | history-service-go                       | Go 1.23.x      | AWS Lambda     |
| 56 | opsheetmobilego                       | ops-mobile-go                            | Go 1.23.x      | AWS Lambda     |
| 57 | opsheetschedulesingest                | opshin-schedules-ingest                  | Go 1.23.x      | AWS Lambda ALB |
| 58 | opsheetsystemeventingest              | opshin-system-event-ingest               | Go 1.23.x      | AWS Lambda ALB |
| 59 | opsheetout                            | opsheet-suite-infra                      | Node.js        | Docker Fargate |
| 60 | opsheetbigproxy                       | opsheet-suite-infra                      | TypeScript     | AWS Lambda     |
| 61 | opsheetcore                           | opsheet-suite-infra                      | Go 1.23.x      | N/A            |
| 62 | opsheetui                             | opsheet-suite-infra                      | TypeScript     | N/A            |
| 63 | opsheetin                             | opsheet-suite-infra                      | Go 1.23.x      | N/A            |
| 64 | opsheetdefinitiontables               | definition-tables-service                | Go 1.23.x      | AWS Lambda     |
| 65 | opsheetweb                            | opsheet-plus-web                         | TypeScript     | Docker Fargate |
| 66 | opsheetwaittimesservice               | wait-time-service-go                     | Go 1.23.x      | AWS Lambda     |
| 67 | countsresummarizationgo               | counts-resummarization-go                | Go 1.23.x      | AWS Lambda     |
| 68 | opsheetcleservice                     | cle-service-go                           | Go 1.23.x      | AWS Lambda     |
| 69 | opsheetwaittimesapiingest             | wait-times-monorepo-go                   | Go 1.23.x      | AWS Lambda ALB |
| 70 | opsheetwaittimeseventingest           | wait-times-monorepo-go                   | Go 1.23.x      | AWS Lambda ALB |
| 71 | opsheetprocessscheduledatasync        | schedules-monorepo-go                    | Go 1.23.x      | AWS Lambda     |
| 72 | opsheetscheduledatasnapshotservice    | schedules-monorepo-go                    | Go 1.23.x      | AWS Lambda     |
| 73 | opsheetfutureeventpolling             | future-event-polling-go                  | Go 1.23.x      | Docker         |
| 74 | opsheetoperatingstatusmono            | operating-status-mono-go                 | Go 1.23.x      | AWS Lambda     |
| 75 | N/A                                   | opsheet-api-designs                      | Go 1.23.x      | N/A            |
| 76 | opsheetchangenotificationprocessor    | opsheet-change-notification-processor    | Go 1.23.x      | AWS Lambda     |
| 77 | operationsresummarizationgo           | operations-resummarization-go            | Go 1.23.x      | AWS Lambda     |
| 78 | opsheetcountsaveragernotifier         | counts-averager-monorepo-go              | Go 1.23.x      | AWS Lambda     |
| 79 | opsheetcountsaveragerprocessor        | counts-averager-monorepo-go              | Go 1.23.x      | AWS Lambda     |
| 80 | opsheetoperationalinsightsapi         | operating-status-mono-go                 | Go 1.23.x      | AWS Lambda     |
| 81 | opsheetprocesspurgeoperations         | opsheet-process-purge-operations         | Go 1.23.x      | AWS Lambda     |
| 82 | opsheetlostefficiencyprocessservice   | lost-efficiency-process-go               | Go 1.23.x      | AWS Lambda     |

## Monorepos (multiple services per repo)

| Repo Name                  | Services                                                                                                  |
|----------------------------|-----------------------------------------------------------------------------------------------------------|
| `schedules-monorepo-go`    | opsheetschedulesemitservice, opsheetschedulesapiservice, opsheetschedulesprocessservice, opsheetprocessscheduledatasync, opsheetscheduledatasnapshotservice |
| `wait-times-monorepo-go`   | opsheetwaittimesapiingest, opsheetwaittimeseventingest                                                    |
| `counts-averager-monorepo-go` | opsheetcountsaveragernotifier, opsheetcountsaveragerprocessor                                          |
| `operating-status-mono-go` | opsheetoperatingstatusmono, opsheetoperationalinsightsapi                                                 |
| `opsheet-suite-infra`      | opsheetout, opsheetbigproxy, opsheetcore, opsheetui, opsheetin                                            |

## Non-deployable repos (excluded from AppVersion)

- `opsheet-api-designs` — API design specs
- `opsheet-bruno-collections` — Bruno API test collections
- `opsheet-types-go` — Shared Go types
- `opsheet-migration-tools` — Data migration scripts
