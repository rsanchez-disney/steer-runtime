# Business Rules — EVAS WDW

**Version:** v2.51.0-262
**Description:** Entitlement View Assembly Service for DLR Fast Pass Plus

> ⚠️ Auto-generated from Swagger/OpenAPI spec (latest environment). May contain outdated information.

## Domains / Tags

- **Entitlement Modifications**
- **EntitlementVAS**
- **Orders**

## API Endpoints

### Entitlement Modifications

  - `POST /entitlements/modification-options` — getModificationOptions
  - `POST /entitlements/modification-prices` — getModificationPricingCalendar

### EntitlementVAS

  - `GET /entitlements/B2C/{owner_id}/tickets` — getEntitlements
  - `GET /entitlements/v2/B2C/{owner_id}/ap-products` — getAnnualPassProducts
  - `GET /entitlements/v2/B2C/{owner_id}/tickets` — getEntitlementsV2
  - `GET /entitlements/{visual_id}` — getEntitlement

### Orders

  - `GET /orders/{confirmation_number}/tickets` — getOrders
  - `GET /orders/{confirmation_number}/{secure_token}` — getOrderWithSecureToken

## Key Data Models

### AddressResource

| Field | Type | Description |
|-------|------|-------------|
| `addressLine1` | string |  |
| `addressLine2` | string |  |
| `addressLine3` | string |  |
| `addressType` | string |  |
| `city` | string |  |
| `country` | string |  |
| `phoneNumber` | string |  |
| `postalCode` | string |  |
| `stateProvinceRegion` | string |  |

### AddressResourceV2

| Field | Type | Description |
|-------|------|-------------|
| `addressLine1` | string |  |
| `addressLine2` | string |  |
| `addressLine3` | string |  |
| `city` | string |  |
| `country` | string |  |
| `email` | string |  |
| `postalCode` | string |  |
| `stateProvince` | string |  |
| `telephone` | string |  |

### Affiliation
Map containing the list of affiliations.

| Field | Type | Description |
|-------|------|-------------|
| `description` | string |  |
| `name` | string |  |
| `priorityOrder` | integer |  |

### AggregatedPrice
List of aggregated prices

| Field | Type | Description |
|-------|------|-------------|
| `availability` | boolean |  |
| `fpAvailability` | boolean |  |
| `pricing` | #/components/schemas/Pricing |  |
| `pricingPerSKU` | array |  |
| `stopSale` | boolean |  |
| `validityEndDate` | string |  |
| `validityStartDate` | string |  |

### AnnualPassProductsResponse

| Field | Type | Description |
|-------|------|-------------|
| `addOns` | object | Map of AddOns Details |
| `affiliations` | object | Map containing the list of affiliations. |
| `blockoutConfiguration` | object | Map containing the blockoutConfiguration when the content of the blockoutNotifications for mobile will be loaded |
| `blockoutDates` | object | Map of blockoutdates with productTypeId as keys |
| `blockoutDatesEndDates` | object | Map of blockout calendar end dates with productTypeId as keys |
| `descriptions` | object | Map of Desdriptions with DescriptionId as keys |
| `features` | object | Map of Features with featureId as keys |
| `friendsAndFamily` | array | List of friends and family linked to user |
| `guestId` | string | Guest ID |
| `policies` | object | Map of policies with policyId as keys |
| ... | | *6 more fields* |

### AssociatedGuestResource
List of friends and family linked to user

| Field | Type | Description |
|-------|------|-------------|
| `age` | string |  |
| `avatarId` | string |  |
| `birthdate` | string |  |
| `firstName` | string |  |
| `guid` | string |  |
| `lastName` | string |  |
| `middleName` | string |  |
| `swid` | string |  |
| `xid` | string |  |

### BookingResource

| Field | Type | Description |
|-------|------|-------------|
| `contextId` | string |  |
| `pahsku` | string |  |
| `sku` | string |  |
| `sourceSystem` | string |  |

### BundleComponent

| Field | Type | Description |
|-------|------|-------------|
| `facilityId` | string |  |
| `optional` | boolean |  |
| `parkName` | string |  |
| `productInstanceId` | string |  |
| `sku` | string |  |
| `type` | string |  |

### CategoryResource
Category

| Field | Type | Description |
|-------|------|-------------|
| `displayInMobile` | boolean |  |
| `id` | string |  |
| `name` | string |  |

### CmeReservationDto
Information about the reservations on this entitlement. CME source based

| Field | Type | Description |
|-------|------|-------------|
| `arrivalDate` | string |  |
| `confirmationId` | string |  |
| `expPark` | string |  |
| `reservationDetails` | #/components/schemas/EligibilityReservationResource |  |

### DescriptionResource

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer |  |
| `key` | string |  |
| `sections` | object |  |
| `text` | string |  |
| `type` | string |  |
| `usageType` | string |  |

### DiscountGroup

| Field | Type | Description |
|-------|------|-------------|
| `id` | string |  |
| `name` | string |  |

### EligibilityReservationResource

| Field | Type | Description |
|-------|------|-------------|
| `ageGroup` | string |  |
| `cancellationEligible` | boolean |  |
| `modificationEligible` | boolean |  |
| `productId` | string |  |
| `productName` | string |  |
| `resId` | string |  |
| `reservationStatus` | string |  |
| `ticketVisualId` | string |  |

### EligibleProduct
The List of Eligible Products

| Field | Type | Description |
|-------|------|-------------|
| `addon` | string | The addon of this Product Instance |
| `ageGroup` | string | Age group of Product Instance |
| `flex` | boolean | Whether or not this product is a Flex ticket |
| `geniePlus` | boolean | Whether or not this product is a Genie+ product |
| `id` | string | Product Instance Id |
| `maxPass` | boolean | Whether or not this product has MaxPass |
| `modificationPrice` | #/components/schemas/ModificationPrice |  |
| `numberOfDays` | integer | Number of Days of Product Instance |
| `parkId` | string | Eligible park to enter |
| `sku` | string |  |
| ... | | *2 more fields* |

### Entitlement
List of entitlements

| Field | Type | Description |
|-------|------|-------------|
| `assignedGuest` | #/components/schemas/GuestResourceV2 |  |
| `barcodeImage` | string | Barcode image as base64-encoded string |
| `castMemberSupplementalTicket` | boolean | Indicates whether this is a supplemental ticket and its type: true for cast member supplemental tickets, false for guest supplemental tickets, null for all other tickets. |
| `category` | #/components/schemas/CategoryResource |  |
| `components` | array | List of components |
| `currentTicketValue` | number | Current ticket value used for AP upgrades |
| `daysRemaining` | integer | The number of days remaining on the ticket |
| `defaultRenewableProductId` | string | Default renewable product instance id. It could be missing if it was not possible to determine the corresponding renewable PI (this could happen for example if the current product can no longer be renewed) |
| `entitlementDaysClassification` | string | Entitlement Days Classification |
| `entitlementUpgradeStatus` | string | Upgrade status. |
| ... | | *65 more fields* |

### EntitlementModificationRequest
List of entitlements

| Field | Type | Description |
|-------|------|-------------|
| `productInstanceIdToQuote` | string | Product instance id to get pricing calendar for |
| `visualId` | string | Visual id of the entitlement |

### EntitlementResponse

| Field | Type | Description |
|-------|------|-------------|
| `entitlement` | #/components/schemas/TicketResourceV2 |  |
| `productInstance` | #/components/schemas/ProductInstanceResource |  |
| `productInstances` | object | Map of Product Instances, with productInstanceIds being the keys |

### EntitlementWithEligibleProducts
List of Entitlements with Eligible Products

| Field | Type | Description |
|-------|------|-------------|
| `eligibleProducts` | array | The List of Eligible Products |
| `productInstanceId` | string | Product Instance Id |
| `quoteToken` | string | Quote Token |
| `visualId` | string | Store Id |

### EntitlementsResponse

| Field | Type | Description |
|-------|------|-------------|
| `addOns` | object | Map of AddOn definitions |
| `affiliations` | object | Map containing the list of affiliations. |
| `blockoutDates` | object | Map of blockoutdates with productTypeId as keys |
| `blockoutDatesEndDates` | object | Map of blockout calendar end dates with productTypeId as keys |
| `containsPriceFromDPE` | boolean | Indicates if there's at least one dynamically priced product |
| `descriptions` | object | Map of Desdriptions with DescriptionId as keys |
| `entitlements` | array | List of entitlements |
| `features` | object | Map of Features with featureId as keys |
| `guestId` | string | Guest ID |
| `policies` | object | Map of policies with policyId as keys |
| ... | | *4 more fields* |

### ErrorResponse

| Field | Type | Description |
|-------|------|-------------|
| `errorCode` | string |  |
| `errorMessage` | string |  |
| `statusCode` | string |  |


---
*Total endpoints: 8 | Total schemas: 58*
