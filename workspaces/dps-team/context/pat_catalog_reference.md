# PAT Catalog Reference

Reference data for the PAT Data Agent — endpoints, queries, request templates, and lookup tables.

---

## PAT Authoring GraphQL Endpoints

| Variable                       | Site | Environment | URL                                                                      |
|--------------------------------|------|-------------|--------------------------------------------------------------------------|
| `DPS_PAT_AUTHORING_DLP_LATEST` | DLP  | latest      | `https://latest.product-authoring-svc-dlp.wdprapps.disney.com/graphql`   |
| `DPS_PAT_AUTHORING_DLP_STAGE`  | DLP  | stage       | `https://stage.product-authoring-svc-dlp.wdprapps.disney.com/graphql`    |
| `DPS_PAT_AUTHORING_DLR_LATEST` | DLR  | latest      | `https://latest2.product-authoring-svc-dlr.wdprapps.disney.com/graphql`  |
| `DPS_PAT_AUTHORING_DLR_STAGE`  | DLR  | stage       | `https://stage.product-authoring-svc-dlr.wdprapps.disney.com/graphql`    |

## DPS API Endpoints

| Variable              | Site | Environment | URL                                                                       |
|-----------------------|------|-------------|---------------------------------------------------------------------------|
| `DPS_API_DLR_LATEST`  | DLR  | latest      | `https://latest.dps-dlr.wdprapps.disney.com/api/v1/sales-offers/packages` |
| `DPS_API_DLR_STAGE`   | DLR  | stage       | `https://stage.dps-dlr.wdprapps.disney.com/api/v1/sales-offers/packages`  |
| `DPS_API_DLP_LATEST`  | DLP  | latest      | `https://latest.dps-dlp.wdprapps.disney.com/api/v1/sales-offers/packages` |
| `DPS_API_DLP_STAGE`   | DLP  | stage       | `https://stage.dps-dlp.wdprapps.disney.com/api/v1/sales-offers/packages`  |

Endpoint paths:

| Flow                    | Path                       | Method |
|-------------------------|----------------------------|--------|
| Offer Search            | `/offers`                  | POST   |
| Selected Package Offers | `/selected-package-offers` | POST   |
| Offer Quote             | `/offer-quote`             | POST   |
| Offer Freeze            | `/offer-freeze`            | POST   |
| Confirm Freeze          | `/offer-freeze/confirm`    | POST   |

## Auth Token

```text
POST ${DPS_AUTH_TOKEN_URL}?grant_type=client_credentials&client_id=${DPS_CLIENT_ID}&client_secret=${DPS_CLIENT_SECRET}&scope=${DPS_SCOPE}
Content-Type: application/x-www-form-urlencoded
```

| Variable            | Description           |
|---------------------|-----------------------|
| `DPS_AUTH_TOKEN_URL` | OAuth2 token endpoint |
| `DPS_CLIENT_ID`     | OAuth2 client ID      |
| `DPS_CLIENT_SECRET`  | OAuth2 client secret  |
| `DPS_SCOPE`         | OAuth2 scopes         |

---

## Environment Configuration

```bash
source ~/.env.dps
# DPS_PAT_ELIGIBILITY_URL, DPS_PAT_AUTHORING_URL, DPS_AUTH_TOKEN_URL
# DPS_CLIENT_ID, DPS_CLIENT_SECRET, DPS_SCOPE, DPS_TOKEN
```

Token acquisition: `eval $(dps-token)`

---

## Full Nested GraphQL Query (L1–L4)

```graphql
query GetProductCatalog($productCodes: [String]) {
  productCatalog(productRequest: { productCodes: $productCodes }) {
    totalProducts
    products {
      productCode productName portfolioProductCode sourceProductTemplateCode
      sourceProductCode statusCode salesStart salesEnd usageStart usageEnd
      distributionChannels { code name }
      markets { marketCode marketName }
      affiliations { affiliationCode affiliationName }
      clientGroups { clientGroupCode clientGroupName }
      companies { companyCode companyName }
      divisions { divisionCode divisionName }
      brands { brandCode brandName }
      attributes { code value }
      clientAttributes {
        clientCode
        clientAttributeDetails { code id clientCode value name type level levelCode }
      }
      offers {
        code name
        offerClassification {
          classificationCode classificationName level parentClassificationCode
          parentClassification { classificationCode classificationName level parentClassificationCode }
        }
      }
      partyMix {
        partyMixControls {
          minTotal maxTotal minAny maxAny minAdult maxAdult
          minChild maxChild minInfant maxInfant stdAny stdAdult stdChild stdInfant
        }
      }
      ages { ageType ageTypeDescription ageCode ageName minAge maxAge }
      locationRestrictions { locationName locationCode }
      productDurations { duration durationUOM }
      productClassifications { classificationCode classificationName level parentClassificationCode }
      bundleCategories {
        bundleCategoryId productCode classificationCode optional selectable
        maxSelection durationMin durationMax durationModifier frequency method
        productBundleComponents {
          productCode productName portfolioProductCode sourceProductTemplateCode
          sourceProductCode statusCode salesStart salesEnd usageStart usageEnd
          distributionChannels { code name }
          markets { marketCode marketName }
          attributes { code value }
          offers { code name }
          partyMix {
            partyMixControls {
              minTotal maxTotal minAny maxAny minAdult maxAdult
              minChild maxChild minInfant maxInfant stdAny stdAdult stdChild stdInfant
            }
          }
          ages { ageType ageTypeDescription ageCode ageName minAge maxAge }
          productDurations { duration durationUOM }
          productClassifications { classificationCode classificationName level parentClassificationCode }
          bundleCategories {
            bundleCategoryId productCode classificationCode optional selectable
            maxSelection durationMin durationMax durationModifier frequency method
            productBundleComponents {
              productCode productName portfolioProductCode sourceProductTemplateCode
              sourceProductCode statusCode
              attributes { code value }
              productDurations { duration durationUOM }
              productClassifications { classificationCode classificationName level parentClassificationCode }
              bundleCategories {
                bundleCategoryId productCode classificationCode optional selectable maxSelection
                productBundleComponents {
                  productCode productName portfolioProductCode sourceProductTemplateCode
                  sourceProductCode statusCode
                  attributes { code value }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

Variables: `{"productCodes": ["<PACKAGE_CODE>"]}`

---

## Request Templates

### Offer Search (with Scoring)

```json
{
  "packageOfferForm": "{{scoringScheme}}",
  "offerAction": "GetOffers",
  "guestContext": {"affiliations": [{"value": "{{affiliation}}", "type": "ONLINE_WEB"}]},
  "travelDates": {"startDate": "{{startDate}}", "endDate": "{{endDate}}"},
  "travelPartyGroups": [{"guests": [{{guests}}]}],
  "stayPreference": {"resortAccommodationPreferences": [{"resort": {"id": {"code": "{{resortCode}}"}}}], "accommodationCount": {"type": "UpTo", "count": 1}},
  "additionalPreferences": [{"code": "PlanType", "values": ["{{planType}}"]}],
  "country": {"iso2CountryCode": "{{countryCode}}"},
  "currency": {"code": "{{currencyCode}}"},
  "businessContext": {"pointOfOrigin": "WDPRO", "destinationId": "{{destinationId}}", "distributionChannel": "Internet"}
}
```

### Offer Search (TBX)

Same as above but with `travelAgency`, `pointOfOrigin: "SBC"`, `distributionChannel: "Call Center"`, `sourceOfBusiness: "INTC"`.

### Selected Package Offers (Direct)

```json
{
  "travelDates": {"startDate": "{{startDate}}", "endDate": "{{endDate}}"},
  "travelParty": {"guests": [{{guests}}], "currency": "{{currencyCode}}"},
  "productSelection": [{"selectedGuests": [{"guests": [{{guests}}]}], "marketingOfferId": {"type": "TBX_PACKAGE", "code": "{{sku}}"}, "planTypes": ["{{planType}}"], "products": [{"facilities": [{"code": "{{resortCode}}"}], "productCode": [{"selected": true, "type": "TBX_ROOM_TYPE_CODE", "code": "{{roomCode}}"}], "count": 1}]}],
  "channel": {"company": "{{company}}", "division": "{{division}}", "brand": "CORE", "sourceMarket": "{{sourceMarket}}", "clientGroup": "{{clientGroup}}", "distributionChannel": "{{distributionChannel}}"}
}
```

### Selected Package Offers (TBX)

Non-room products use `attributes` instead of `productCode`:

```json
"attributes": [
  {"name": "TBX_CATEGORY_CODE", "type": "TBX", "values": ["{{value}}"]},
  {"name": "TBX_ELEMENT_GROUP", "type": "TBX", "values": ["{{value}}"]},
  {"name": "TBX_PRODUCT_TYPE", "type": "TBX", "values": ["{{value}}"]}
]
```

TBX attribute mapping:

| Attribute           | Source from PAT                                                                            |
|---------------------|--------------------------------------------------------------------------------------------|
| `TBX_CATEGORY_CODE` | Tickets: `ReferenceProductCode` attribute. Ancillaries: `productCode` at L3               |
| `TBX_ELEMENT_GROUP` | Classification code at level 1 in component's `productClassifications`                    |
| `TBX_PRODUCT_TYPE`  | Classification code at deepest level in component's `productClassifications`              |

Room products: list ALL room codes with `selected: true/false`. Accommodation entry uses `facilities` and empty `attributes`.

### Offer Quote

```json
{
  "offerId": "{{offerId}}",
  "travelDates": {"startDate": "{{startDate}}", "endDate": "{{endDate}}"},
  "travelParty": {"guests": [{{guests}}]},
  "marketingOfferId": {"value": "{{marketingOfferId}}"},
  "planType": "{{planType}}",
  "productSelection": [{"facility": {"code": "{{resortCode}}"}, "productCode": {"type": "TBX_ROOM_TYPE_CODE", "code": "{{roomCode}}"}, "sku": "{{sku}}", "count": 1}],
  "country": {"iso2CountryCode": "{{countryCode}}"},
  "currency": {"code": "{{currencyCode}}"},
  "businessContext": {"pointOfOrigin": "WDPRO", "destinationId": "{{destinationId}}", "distributionChannel": "Internet"}
}
```

### Offer Freeze (Direct)

```json
{
  "offerId": "{{offerId}}",
  "travelDates": {"startDate": "{{startDate}}", "endDate": "{{endDate}}"},
  "travelParty": {"groups": [{"guests": [{{guests}}]}], "currency": "{{currencyCode}}"},
  "marketingOfferId": {"type": "TBX_PACKAGE", "code": "{{sku}}"},
  "planType": "{{planType}}",
  "productSelection": [{"facility": {"code": "{{resortCode}}"}, "productCode": {"type": "TBX_ROOM_TYPE_CODE", "code": "{{roomCode}}"}, "count": 1}],
  "channel": {"company": "{{company}}", "division": "{{division}}", "brand": "CORE", "sourceMarket": "{{sourceMarket}}", "clientGroup": "{{clientGroup}}", "distributionChannel": "{{distributionChannel}}"},
  "overrides": {"bypassAvailability": false, "bypassBidPriceCheck": false, "includeGuestPricing": true}
}
```

### Offer Freeze (TBX)

Same as Direct but non-room products use `attributes` (TBX_CATEGORY_CODE, TBX_ELEMENT_GROUP, TBX_PRODUCT_TYPE). Same mapping rules as Selected Package Offers TBX.

### Offer Freeze (TEP3 Daily Selectable)

Structure:

- `productSelection[0]` — Room (facility + productCode + count)
- `productSelection[1]` — Ticket Portfolio (`classification: "TKTPORTFO"`) with nested `selectedProducts` → `selectedOptions` → `selectedChoices`

Rules:

- Each `selectedProducts` = one admission type (adult vs child)
- `selectedOptions[0].selectedChoices` = park selections per day
- `selectedOptions[1].selectedChoices` = add-ons (Genie+) per day
- `selectedDates` must cover all travel days
- `count` at selectedChoices = number of guests of that type
- `classification: "1D_1PARK"` for single-day single-park
- `duration.value` always `1` with `measure: "DAYS"`

Full example: see `SAMPLE_RT_ALL_NME_V1` with `TKT_PORTFOLIO_V1`, admissions `P3D1PATBX`/`P3D1PCTBX`, parks `CAT002DGT` (DCA) / `CAT001DGT` (DL), add-on `CAT009DGT`.

---

## Key Differences Between Request Types

| Aspect             | Offer (scored)                    | Offer (TBX)    | Selected-Pkg (Direct) | Selected-Pkg (TBX)        | Quote              | Freeze (Direct)    | Freeze (TBX)       |
|--------------------|-----------------------------------|----------------|----------------------|---------------------------|--------------------|--------------------|---------------------|
| Scoring scheme     | Required                          | Required       | Not used             | Not used                  | Not used           | Not used           | Not used            |
| Travel party       | `travelPartyGroups[].guests[]`    | Same           | `travelParty.guests[]` | Same + affiliations     | `travelParty.guests[]` | `travelParty.groups[].guests[]` | Same + affiliations |
| Non-room products  | N/A                               | N/A            | `productCode`        | `attributes` (TBX_*)      | `productCode`      | `productCode`      | `attributes` (TBX_*) |
| Room products      | Optional (filters)                | Optional       | TBX_ROOM_TYPE_CODE   | All rooms listed           | `productCode`      | `productCode`      | All rooms listed    |
| Channel            | In businessContext                | Same           | Separate `channel`   | Same                      | Optional           | Separate `channel` | Same                |
| Marketing offer ID | Not used                          | Not used       | `Code` (type+code)   | `Code` (type+code+name)   | `IdResource` (value) | `Code` (type+code) | `Code` (type+code+name) |
| offerId            | Not used                          | Not used       | Not used             | Not used                  | Required           | Optional           | Optional            |

---

## Reference Data

### DLR Resort Codes

| Code  | Resort                                    |
|-------|-------------------------------------------|
| EGLPH | Pixar Place Hotel                         |
| GBLDH | Disney's Grand Californian Hotel & Spa    |
| DNBH  | Disneyland Hotel                          |

### Common Scoring Schemes (DLR)

| Scheme Name                        | Use Case                                  |
|------------------------------------|-------------------------------------------|
| Web DLR Shallow Search Alternate   | Standard web search (1 room type/result)  |
| Web DLR Deep Search Alternate      | Deep search (multiple room types)         |
| UAD DLR GetOffers                  | Unassisted device search                  |

### Plan Types

| Code | Description      |
|------|------------------|
| RO   | Room Only        |
| RT   | Room + Ticket    |
| RMO  | Room + Meal Only |

### Business Context Defaults

| Field               | DLR Direct | DLR TBX    | DLP  |
|---------------------|------------|------------|------|
| pointOfOrigin       | WDPRO      | SBC        | SBC  |
| destinationId       | DLR        | DLR        | DLP  |
| distributionChannel | Internet   | Call Center | Internet |
| sourceOfBusiness    | INTA       | INTC       | INTA |

### Channel Defaults

| Field               | DLR Direct (DD) | DLR TBX (WDTC) | DLP Direct | DLP TBX |
|---------------------|-----------------|-----------------|------------|---------|
| company             | DD              | WDTC            | 024        | 024     |
| division            | DDDLR           | WDTCDLR         | DPV        | DPV     |
| brand               | CORE            | CORE            | RBB        | RBB     |
| sourceMarket        | US              | US              | FR         | FR      |
| clientGroup         | –               | TA              | Direct     | TO      |
| distributionChannel | I               | C               | I          | 3       |

### Guest Templates

```json
[{"ageGroup": "ADULT"}, {"ageGroup": "ADULT"}]
[{"ageGroup": "ADULT"}, {"ageGroup": "ADULT"}, {"ageGroup": "CHILD", "age": 6}]
[{"ageGroup": "ADULT", "age": 30}]
[{"ageGroup": "ADULT"}, {"ageGroup": "ADULT"}, {"ageGroup": "CHILD", "age": 8}, {"ageGroup": "INFANT", "age": 1}]
```

### Override Combinations

| Scenario                    | Key Overrides                            |
|-----------------------------|------------------------------------------|
| Bypass availability         | `"bypassAvailability": true`             |
| Include component pricing   | `"includePackageComponentPrice": true`   |
| Include guest-level pricing | `"includeGuestPricing": true`            |
| Booking date override       | `"bookingDateOverride": "2026-01-15"`    |
| Include assumptive add-ons  | `"includeAssumptiveAddOns": true`        |

---

## Common PAT Misconfigurations and DPS Failures

| Symptom in DPS                       | Likely PAT Cause                                             | What to Check                     |
|--------------------------------------|--------------------------------------------------------------|-----------------------------------|
| Package not returned in offer search | statusCode ≠ AVAILABLE, or sales/usage dates expired         | L1 status and date fields         |
| "No eligible rooms" error            | ACCOMMODATION bundle missing or all rooms have wrong status  | Bundle 3 components and status    |
| Party mix validation failure         | partyMix constraints too restrictive or missing              | L1 partyMixControls               |
| Channel not eligible                 | Missing distributionChannel, market, or clientGroup          | L1 channel fields                 |
| Ticket not included in offer         | ADMISSION bundle duration mismatch with LOS                  | Bundle 2 duration fields          |
| Room occupancy mismatch              | Room-level partyMix doesn't accommodate requested party      | L3 accommodation partyMixControls |
| "Product not found" in quote/freeze  | productCode at L3/L4 has statusCode ≠ AVAILABLE             | Component status fields           |
| Ancillary missing from offer         | ANCILLARY bundle frequency/method wrong                      | Bundle 1 frequency and method     |
| Price parent room not resolving      | `priceParentRoomTypeCode` points to non-existent room        | Room attributes                   |
| Classification mismatch              | Product classification chain broken (missing parent level)   | productClassifications hierarchy  |

---

## Jira-Driven Test Generation — Signal Mapping

| Signal in Ticket           | Flows to Test                    | Request Types Needed                                  |
|----------------------------|----------------------------------|-------------------------------------------------------|
| Scoring changes            | Offer search                     | PackageOffersRequest with specific scoring scheme     |
| PAT eligibility changes    | Offer search, Selected-pkg       | Both request types with affected SKUs                 |
| Price protection / quote   | Quote                            | OfferQuoteRequest with offerId from prior search      |
| Freeze/confirm changes     | Freeze                           | FreezeRequest + ConfirmFreezeRequest                  |
| TBX code translation       | Offer (TBX)                      | PackageOffersRequest with TBX business context        |
| Multi-room / party mix     | All flows                        | Requests with multiple travelPartyGroups/groups       |
| DLP-specific               | All flows                        | Requests with DLP destination, channel, codes         |
| Availability bypass        | Quote, Freeze                    | Requests with overrides.bypassAvailability=true       |
| New product type           | Offer, Quote, Freeze             | Full flow with new classification/product codes       |

---

## Response Validation Checklist

### Offer search

| Check                     | What to Verify                                             |
|---------------------------|------------------------------------------------------------|
| Package returned          | `offers[].packageCode` matches expected SKU                |
| Room types present        | `offers[].accommodations[].roomTypeCode` matches PAT rooms |
| Ticket included           | `offers[].admissions[]` present with correct duration      |
| Pricing populated         | `offers[].pricing.totalPrice` is non-null and > 0          |
| Scoring applied           | Offers ordered by score (if scoring scheme provided)       |

### Quote

| Check               | What to Verify                                                     |
|---------------------|--------------------------------------------------------------------|
| Price matches offer | Quote price ≥ offer price (may include taxes/fees)                 |
| Component breakdown | `components[]` lists room, ticket, ancillary with individual prices |
| Deposit amount      | `deposit.amount` populated if applicable                           |

### Freeze

| Check              | What to Verify                     |
|--------------------|------------------------------------|
| Freeze ID returned | `freezeId` is non-null UUID        |
| Expiration set     | `expiresAt` is in the future       |
| Inventory held     | Status is FROZEN (not FAILED)      |
| Price locked       | `pricing.totalPrice` matches quote |
