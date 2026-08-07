# Business Rules — Lexicon Service

**Version:** 3.0
**Description:** Lexicon CRUD endpoints for Lexicon UI

> ⚠️ Auto-generated from Swagger/OpenAPI spec (latest environment). May contain outdated information.

## Domains / Tags

- **addon**
- **admin**
- **affiliation**
- **alternateId**
- **audit**
- **bookingInfo**
- **bundleComponentMapping**
- **caches**
- **calendar**
- **capacity-event**
- **category**
- **deliveryoption**
- **description**
- **discountgroup**
- **entity-load**
- **facility**
- **feature**
- **health**
- **job**
- **marketRegion**
- **marketRegion-summary**
- **media**
- **name**
- **offer**
- **policies**
- **productinstance**
- **product-load**
- **producttype**
- **application**
- **publish-message**
- **tsr**
- **ticketSkuMapping**
- **ticketSkuMappingSummary**
- **translation**
- **ttc**
- **useraudit**

## API Endpoints

### addon

  - `GET /addon` — findAll
  - `GET /addon/{id}` — find

### admin

  - `GET /admin/configuration-manager-properties` — viewConfigManagerDynamicProperties
  - `GET /admin/dynamic-properties` — viewDynamicProperties
  - `GET /admin/end-date-configurations` — getEndDateConfigs
  - `DELETE /admin/end-date-configurations` — purgeEndDateRedisCache
  - `PUT /admin/force-end-date-cache-refresh` — forceEndDateCacheRefreshAndProcess
  - `GET /admin/properties` — viewProperties

### affiliation

  - `GET /affiliation` — findAll_1
  - `GET /affiliation/{id}` — find_1

### alternateId

  - `GET /alternateId` — findAll_2
  - `GET /alternateId/{id}` — find_2

### application

  - `GET /application/version` — getVersion

### audit

  - `GET /audit/query` — findAuditRecords
  - `GET /audit/{id}` — find_3

### bookingInfo

  - `GET /bookingInfo/{id}` — find_4

### bundleComponentMapping

  - `GET /bundle-component-mapping` — findAll_3
  - `POST /bundle-component-mapping/manual-sync` — manuallySyncBundleComponentMappings
  - `GET /bundle-component-mapping/{id}` — find_5

### caches

  - `GET /admin/redis/caches` — getCaches
  - `GET /admin/redis/caches/stats` — getStats
  - `GET /admin/redis/caches/{cacheName}` — getCacheKeys
  - `GET /admin/redis/caches/{cacheName}/{cacheKey}` — getValues

### calendar

  - `GET /calendar` — findAll_4
  - `GET /calendar/destination/{destinationId}` — findByDestinationId
  - `GET /calendar/{id}` — find_6

### capacity-event

  - `GET /capacity-event/cache/keys` — getCapacityEventsCacheKeys
  - `GET /capacity-event/destination/{destinationId}` — getCapacityEventTypes
  - `PUT /capacity-event/destination/{destinationId}` — getAndLoadCapacityEvents

### category

  - `GET /category` — findAll_5
  - `GET /category/{id}` — find_7

### deliveryoption

  - `GET /deliveryoption` — findAll_6
  - `GET /deliveryoption/destination/{destinationId}` — findByDestinationId_1
  - `GET /deliveryoption/load/destination/{destinationId}` — findAndLoadDeliveryOptionsyDestination
  - `GET /deliveryoption/{id}` — find_8

### description

  - `GET /description` — findAll_7
  - `GET /description/{id}` — find_9

### discountgroup

  - `GET /discountgroup` — findAll_8
  - `GET /discountgroup/{id}` — find_10

### entity-load

  - `GET /entity-load/affiliationId/{affiliationId}` — getAffiliationById
  - `GET /entity-load/affiliations` — getAffiliations
  - `GET /entity-load/bundles` — getAllBundles
  - `GET /entity-load/bundles/destination/{destinationId}` — getBundlesByDestination
  - `GET /entity-load/bundles/load/destination/{destinationId}` — loadAndCacheBundlesByDestination
  - `GET /entity-load/delivery-options` — getDeliveryOptions
  - `GET /entity-load/discount-groups` — getDiscountGroups
  - `GET /entity-load/discountgroupId/{discountgroupId}` — getDiscountGroupById

### facility

  - `GET /facility` — findAll_9
  - `GET /facility/{id}` — find_11

### feature

  - `GET /feature` — findAll_10
  - `GET /feature/destination/{destinationId}` — findByDestinationId_2
  - `PUT /feature/load/destination/{destinationId}` — loadFeatureDescriptions
  - `GET /feature/{id}` — find_12

### health

  - `GET /system/health` — healthStatus

### job

  - `GET /job/query` — findJobRecords
  - `GET /job/{id}` — find_13

### marketRegion

  - `GET /marketRegion` — findAll_11
  - `GET /marketRegion/{id}` — find_14

### marketRegion-summary

  - `GET /marketRegion/summary` — findAll_12
  - `GET /marketRegion/summary/{id}` — find_15

### media

  - `GET /media` — findAll_13
  - `GET /media/{id}` — find_16

### name

  - `GET /name` — findAll_14
  - `GET /name/{id}` — find_17

### offer

  - `GET /offer` — findAll_15
  - `GET /offer/{id}` — find_18

### policies

  - `GET /policies` — findAll_16
  - `GET /policies/destination/{destinationId}` — findByDestinationId_3
  - `GET /policies/load/destination/{destinationId}` — loadByDestinationId
  - `PUT /policies/load/destination/{destinationId}` — loadPoliciesByDestination
  - `GET /policies/{id}` — find_19

### product-load

  - `GET /product-load/pibis/destination/{destinationId}` — findPIBISByBrand
  - `GET /product-load/pibis/get-by-store` — getPIBISByStoreAndBrand
  - `GET /product-load/pibis/load-by-store` — loadAndCachePibisByStoreAndBrand
  - `GET /product-load/pibis/load-by-store-v2` — loadAndCachePibisByStoreAndBrandV2
  - `GET /product-load/pibis/storeId/{storeId}` — getPIBISByStore
  - `GET /product-load/producttype/destination/{destinationId}` — findProductTypeByDestinationId
  - `GET /product-load/producttype/load/destination/{destinationId}` — findAndLoadProductTypesByDestination
  - `GET /product-load/stores` — findAllStores
  - `GET /product-load/stores/brand/{brand}` — findStores
  - `GET /product-load/stores/changed/{clientId}` — getRecentlyUpdatedStores
  - `GET /product-load/v2/stores/changed/{duration}` — getRecentlyUpdatedStoresV2

### productinstance

  - `PUT /productinstance/load/names/destination/{destinationId}` — loadProductInstanceNames
  - `GET /productinstance/search` — productSearch
  - `GET /productinstance/summary/producttype/{productTypeId}` — findSummaryByProductTypeId
  - `GET /productinstance/{id}` — find_20

### producttype

  - `GET /producttype/destination/{destinationId}` — findByDestinationId_4
  - `GET /producttype/summary/destination/{destinationId}` — findSummaryByDestinationId
  - `GET /producttype/{id}` — find_21

### publish-message

  - `GET /publish/{destination}/pibi-cache-refresh-all-stores` — publishPibiCacheRefresh
  - `GET /publish/{destination}/{store}/pibi-cache-refresh` — publishPibiCacheRefresh_1

### ticketSkuMapping

  - `GET /ticketSkuMapping` — findAll_17
  - `GET /ticketSkuMapping/{id}` — find_22

### ticketSkuMappingSummary

  - `GET /ticketSkuMapping/summary` — findByDestination
  - `GET /ticketSkuMapping/summary/{id}` — find_23

### translation

  - `GET /translation` — findAll_18
  - `GET /translation/{id}` — find_24

### tsr

  - `GET /tsr-load/test/input` — getTSRImportHolder
  - `GET /tsr/{destinationId}/product` — find_25

### ttc

  - `GET /ttc-load/productDetailsEndpointLastModified/load` — loadProductDetailsEndpointLastModified
  - `GET /ttc-load/productPricesEndpointLastModified/load` — loadProductPricesEndpointLastModified
  - `GET /ttc-load/storeConfig` — getAllTtcStoreConfigs
  - `GET /ttc-load/storeConfig/load` — loadAndCacheTtcStoreConfig
  - `GET /ttc-load/stores/brand/{brand}` — findStores_1
  - `GET /ttc-load/{brand}/products` — findProducts
  - `GET /ttc-load/{brand}/products/load` — loadProductsBySku
  - `GET /ttcStoreConfig` — findAll_19
  - `GET /ttcStoreConfig/{id}` — find_26

### useraudit

  - `GET /useraudit/find-batch-process-ids` — findBatchProcessIds
  - `GET /useraudit/find-resource` — findByResource
  - `GET /useraudit/find-resources-by-process-id/{batchProcessId}` — findByBatchProcessId
  - `GET /useraudit/query` — findAuditRecords_1
  - `GET /useraudit/{id}` — find_27

## Key Data Models

### Addon

| Field | Type | Description |
|-------|------|-------------|
| `addonKey` | string |  |
| `descriptions` | array |  |
| `destinationId` | string |  |
| `id` | string |  |
| `lastUpdated` | string |  |
| `media` | array |  |
| `name` | string |  |
| `urlFriendlyId` | string |  |

### Affiliation

| Field | Type | Description |
|-------|------|-------------|
| `id` | string |  |
| `lastUpdated` | string |  |
| `name` | string |  |

### AlternateId

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer |  |
| `lastUpdated` | string |  |
| `productTypeId` | string |  |
| `type` | string |  |
| `value` | string |  |

### AuditRecord

| Field | Type | Description |
|-------|------|-------------|
| `action` | string |  |
| `affectedStoreId` | string |  |
| `auditDateTime` | string |  |
| `id` | integer |  |
| `rowId` | integer |  |
| `rowKey` | string |  |
| `tableName` | string |  |
| `user` | string |  |

### BatchProcessSummary

| Field | Type | Description |
|-------|------|-------------|
| `batchProcessId` | string |  |
| `methodCount` | object |  |
| `user` | string |  |

### BookingInformation

| Field | Type | Description |
|-------|------|-------------|
| `bundleId` | string |  |
| `canUseEndDatetime` | #/components/schemas/DateTimeInfo |  |
| `canUseStartDatetime` | #/components/schemas/DateTimeInfo |  |
| `demographicsRequired` | boolean |  |
| `deposit` | #/components/schemas/Pricing |  |
| `facilityId` | string |  |
| `id` | string |  |
| `isUserDefinedPrice` | boolean |  |
| `lastUpdated` | string |  |
| `netDiscount` | number |  |
| ... | | *14 more fields* |

### BundleComponentMappingEntity

| Field | Type | Description |
|-------|------|-------------|
| `active` | boolean |  |
| `bundleProductInstanceId` | string |  |
| `componentProductInstanceId` | string |  |
| `created` | string |  |
| `createdBy` | string |  |
| `id` | integer |  |
| `lastUpdated` | string |  |
| `lastUpdatedBy` | string |  |
| `optional` | boolean |  |

### BundleComponentMappingResource

| Field | Type | Description |
|-------|------|-------------|
| `componentProductInstanceIdsMapped` | array |  |
| `errorMessage` | string |  |
| `productInstanceId` | string |  |
| `sku` | string |  |

### BundleIdentifierResource
Ticket bundle product SKU/product code

| Field | Type | Description |
|-------|------|-------------|
| `productInstanceId` | string | Ticket bundle product instance id |
| `sku` | string | Ticket bundle product SKU/product code |

### BundleMappingManualSyncRequestResource

| Field | Type | Description |
|-------|------|-------------|
| `bundles` | array | Ticket bundle product SKU/product code |

### BundleMappingManualSyncResponseResource

| Field | Type | Description |
|-------|------|-------------|
| `results` | array |  |

### Calendar

| Field | Type | Description |
|-------|------|-------------|
| `description` | string |  |
| `destinationId` | string |  |
| `endDateTime` | #/components/schemas/DateTimeInfo |  |
| `facilityCollection` | array |  |
| `id` | string |  |
| `lastUpdated` | string |  |
| `name` | string |  |
| `numberOfDays` | integer |  |
| `priority` | integer |  |
| `startDateTime` | #/components/schemas/DateTimeInfo |  |
| ... | | *3 more fields* |

### CapacityEvent

| Field | Type | Description |
|-------|------|-------------|
| `endDateTime` | string |  |
| `eventId` | string |  |
| `eventName` | string |  |
| `offSaleDateTime` | string |  |
| `onSaleDateTime` | string |  |
| `resourceId` | string |  |
| `skus` | array |  |
| `startDateTime` | string |  |
| `status` | string |  |

### CapacityEventDate

| Field | Type | Description |
|-------|------|-------------|
| `eventDate` | string |  |
| `events` | array |  |

### CapacityEventType

| Field | Type | Description |
|-------|------|-------------|
| `eventDates` | array |  |
| `eventTypeId` | string |  |
| `productTypeId` | string |  |

### Category

| Field | Type | Description |
|-------|------|-------------|
| `displayInMobile` | boolean |  |
| `id` | string |  |
| `lastUpdated` | string |  |
| `name` | string |  |
| `urlFriendlyId` | string |  |

### Chronology

| Field | Type | Description |
|-------|------|-------------|
| `zone` | #/components/schemas/DateTimeZone |  |

### DateTimeInfo

| Field | Type | Description |
|-------|------|-------------|
| `instant` | #/components/schemas/Instant |  |
| `zone` | #/components/schemas/DateTimeZone |  |

### DateTimeZone

| Field | Type | Description |
|-------|------|-------------|
| `fixed` | boolean |  |
| `id` | string |  |

### DeliveryOption

| Field | Type | Description |
|-------|------|-------------|
| `descriptions` | object |  |
| `id` | string |  |
| `lastUpdated` | string |  |
| `leadTime` | integer |  |
| `name` | string |  |
| `pickupArea` | string |  |
| `pricing` | #/components/schemas/Pricing |  |
| `salesType` | string |  |


---
*Total endpoints: 113 | Total schemas: 60*
