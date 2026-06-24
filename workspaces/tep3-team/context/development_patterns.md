# TEP3 — Development Patterns & Lessons

## TEP3 Gating Pattern

Every TEP3 code change MUST be gated by `hasBundleComponents()` to ensure zero TEP2 impact.

```java
// Correct — explicit gate
if (item.hasBundleComponents()) {
    // TEP3-only logic
}

// Correct — compound gate for bolt kits
if (item.hasBundleComponents() && item.getBundlePricing() != null) {
    // Bolt kit pricing path
}
```

**Rules:**
- The gate must be visible at the point of change, not implied by call chain
- All PRs are reviewed with "is this TEP3 only?" for every modified line
- Shared methods (e.g., `computeTotalPrice()`) called from multiple flows (Create, Update, EA, GP, DVC, Lodging) — gate ensures only TEP3 hits the new path
- `isPriceFromDPE()` is a TEP2-only gate — returns false for TEP3 bolt kits
- The universal TEP3 gate is `hasBundleComponents()`
- Don't change TEP2 behavior when fixing TEP3 — keep blast radius minimal

## Git Commit Convention

```
TEP3-{ticket}: {short summary}
```

- One line only, no body
- Ticket number first, colon, space, description
- No `feat/fix/chore` prefixes — just Jira ticket ID
- Each commit is a logical unit of work

**Branch naming:** `TEP3-{ticket}-{short-description}`

## Cart Service Add-to-Cart Flows

### Standalone Tickets (type=ticket)
```
RestCartServiceImpl
  → DefaultCartService.resolveItem()
    → case TICKET: resolveTicketProduct()
      → LexVAS product-instance resolution
      → [TEP3] DataMapperHelper.updateBundleComponents() — merges request + LexVAS data
      → [TEP3] TPAC availability check (TicketBundleProductsResolutionKey)
      → [TEP3] Price validation (priceChecker.isPriceValid)
```
- `DefaultBoltCartService` NOT involved for standalone tickets
- LexVAS `LexVASProductInstanceResource` carries bundleComponents → enrichment works

### Bolt Kits (type=bundle)
```
RestCartServiceImpl
  → DefaultCartService.resolveItem()
    → case BUNDLE: resolveBundle()
      → boltCartService.populateBundleFromLexVASResource()
        → DefaultBoltCartService.populateProductInstances()
          → Creates TicketProduct from LexVAS ProductInstanceResource
          → [TEP3] Copies bundleComponents from request (direct copy, no LexVAS enrichment)
          → Creates VoucherProducts from LexVAS
```
- `DefaultBoltCartService` IS involved for bolt kits
- LexVAS `ProductInstanceResource` (from bundle discount groups) does NOT carry bundleComponents
- Enrichment (parkName, type, name) not available in bolt kit flow — depends on v3 LexVAS ticket

## Pricing Flow: priceRequired

`priceRequired` controls whether customer price is kept or overwritten by LexVAS:

| Operation | priceRequired | Behavior |
|-----------|:---:|----------|
| Add-to-cart (addItemsScoped) | false | LexVAS price used (could be $0 for bolt kits) |
| PCM bulk update (updateCartScoped) | true | Customer price kept |
| Get-cart | false | Restore pricing from DB |

**Standalone:** `hasBundleComponents()=true` is sufficient for price keeping (no `isPriceFromDPE` needed)

**Bolt kits:** All three required: `dynamicPricingEnabled && isPriceFromDPE() && priceRequired`

**Bolt kit pricing formula:**
- `bundlePrice` = ticket + voucher (combined, from request)
- `ticketUnitPrice` = bundlePrice - voucherPrice (derived)
- On get-cart: reconstruct bundlePrice from DB (ticket + voucher)

## TPAC Availability Rules

- Standalone digital: TPAC runs for all tickets with bundleComponents
- Bolt standalone: TPAC called with `includeAvailability` based on `store.shouldSkipAvailCheck()`
- Bolt kits (type=bundle): TPAC dispatched for ticket product inside kit — price = TPAC ticket + static voucher
- `shouldSkipAvailCheck()` = `boltStore && enableInventoryBypass` (both from Bolt Svc Store API)
- Comp tickets: Skip TPAC — no price check needed for $0 products
- Park-agnostic components: sorted after park-specific items (`Comparator.nullsLast`)

## Key Debugging Lessons

### 1. Trace response to model, not resolver
Response serialization traces to the model. If you never call `setBundle()`, resolved data is invisible. Always trace: REST response → resource class → model.

### 2. New objects don't inherit request data
`populateBundleFromLexVASResource()` creates a NEW `TicketProduct` from LexVAS. It doesn't mutate the unresolved ticket. Request data (pricing, bundleComponents) must be explicitly copied.

### 3. Check contracts early — both request AND response
The request contract may reveal critical changes (e.g., `bundlePricing` replaces `pricingSummary` for bolt kits).

### 4. Don't overwrite client-sent pricing
Let client-sent price pass through to PEOS for comparison — don't replace from cache.

### 5. computeTotalPrice() is shared
Called from Create, Update, EA, GP, DVC, Lodging flows. Gate with `hasBundleComponents() && getBundlePricing() != null`.

### 6. MapStruct field name mismatches
When DAO `prices` vs domain `price`, explicit `@Mapping` annotations required. Without them: empty `{}`.

### 7. Source of truth is PEOS, not cache
Map from PEOS response, not from Redis cache. Cache is stale data.

### 8. Jackson serialization conflicts
`ProductInstanceComponent` has `@JsonProperty("name")` on `getCategoryName()`. Child `BundleComponent` Lombok `name` is shadowed. Fix: override getCategoryName/setCategoryName to delegate to `name` field.

### 9. PricingModal requires updatedBundle data
Setting `priceChanged=true` alone causes NPE — `PricingModalItemBundleResource.getUpdatedBundle().getBundlePrice()`. The swap pattern (updatedBundle = unresolvedBundle with new prices) is required.

## PricingModal (PCM) Patterns

- Dispatches to TPAC when `hasBundleComponentsOnBundle || isBoltBundleDynamicPriceCheckEnabled()`
- Price increase: `headlineContentIncrease` + `[accept, decline]` CTAs
- Price decrease: `headlineContentDecrease` + `[accept(cta-continue)]` CTA
- Mixed cart (increase + decrease): increase WINS → `[accept, decline]`
- Bolt stores: use `hasBundleComponentsOnItem()` to suppress `contentType` (not CartType.DLR check)
- `productDetailsTemplate`: null (park-agnostic), `"productDetails-1P"` (1P), `"productDetails-PH"` (PH)

## TEP3 Validation Pattern

Validators check (gated by `hasBundleComponents()`):
1. Item `id` required when `bundleComponents` present
2. `bundlePricing` required when `boltKitComponents` present
3. `code.alternateIdentifiers` required when `boltKitComponents` present

Pattern: Reuse exact same checks across Create, Update, Submit validators.

## Policy Handling

- Cart-level policies filtered by `getPoliciesForCartPage()` (subgroup: Park Restriction, Affiliation Restriction, Block Out Date, Expiration) + usageType=WDPRO
- If `hasBundleComponents()`: keep existing policyIds, seed HashSet, add filtered bundleComponent policies, dedupe
- `TicketBundleComponentResource.getPolicies()` has `@JsonIgnore` — policies not in bundleComponent JSON, only at cart level
- eTicket subgroup policies filtered out from policyIds

## UAD-Specific Patterns

- No payment session/HMAC from UI — agents handle payments directly
- "Fill or kill" for fraud: Submit returns `status: "PEND"` + `errorCode: "871"` → UAD treats as failed → calls V2 Cancel after delay
- V2 Cancel (TEP3-7857): supports both `orderId.value` OR `transactionDetail.payloadId` (orderId takes precedence)
- Cancel path does NOT include galaxy order ID (not available for PEND orders)

## DRY Patterns — Code & Unit Tests

### Production Code

1. **Extract shared logic to parent class** — When Ticket and Bundle resources share the same logic (e.g., `populateBundleComponentsByType`, `resolveProductDetailsTemplate`), move to the parent `PricingModalItemResource`. Both children call the shared method.

2. **Focused helper methods over complex conditionals** — When a method evaluates multiple conditions (`hasBundleComponents`, `priceRequired`, `isPriceFromDPE`), delegate each path to a single-responsibility helper:
   ```java
   // Main method: evaluates conditions, delegates
   public void resolveBundlePricing(...) {
       if (hasBundleComponents && priceRequired) {
           deriveTicketPriceFromRequest(...);
       } else if (hasBundleComponents && !priceRequired) {
           deriveBundlePriceFromUnitPrice(...);
       } else {
           setFromLexVAS(...);
       }
   }
   ```
   This satisfies PMD CyclomaticComplexity (< 10 per method) and makes each path testable independently.

3. **Reuse validation patterns across APIs** — Create, Update, and Submit validators use the exact same 3 checks inside `hasBundleComponents()` filter. Don't reinvent — mirror the existing validator structure.

4. **MapStruct over manual mapping** — Let MapStruct handle data flow automatically. Remove manual copy-back blocks when MapStruct layers can auto-map fields (e.g., bundlePricing flows through DAO → Domain → Resource without manual intervention).

### Unit Tests

1. **Shared mock builders** — Create reusable helper methods that build test objects:
   ```java
   // Shared across all PCM tests
   private TicketProduct buildTep3Ticket(String sku, BigDecimal price, boolean isComp) { ... }
   private BundleComponent buildComponent(String sku, String date, String type) { ... }
   ```

2. **One test per logical path** — Each gate condition gets its own test:
   - `test_standalone_hasBundleComponents_pricingKept`
   - `test_boltKit_hasBundleComponents_bundlePricingUsed`
   - `test_mods_noPricing_copiedFromCache`
   - `test_tep2_noBundleComponents_unchanged`

3. **Test data in constants, not inline** — Extract SKUs, prices, dates to class-level constants or test fixtures. Reuse across related tests.

4. **DRY test configuration** — If multiple tests need the same mock setup (e.g., `isBoltBundleDynamicPriceCheckEnabled=false`), extract to a `@Before` method or shared helper.

5. **Verify both positive and negative** — Every TEP3 test should have a corresponding TEP2 regression test proving the gate works (TEP2 path unchanged).

## Zero Assumptions Rule (Production Code)

This codebase serves production e-commerce for Disney parks. Every change can affect real guest transactions, revenue, and park operations. The standard is **100% certainty**, not "probably correct."

### Mandatory Practices

1. **TRACE, DON'T GREP** — Always follow the actual call chain from REST endpoint → service → DAO → mapper. Never find a method by name and assume it's the right one. Cart service has parallel implementations (`DefaultCartService` vs `CartDataMapper`) that look similar but serve different flows.

2. **VERIFY EVERY CLAIM** — Before stating "method X is used by flow Y", prove it by reading the call chain. If you can't show the exact sequence of method calls, you don't know the answer.

3. **NO SHORTCUTS ON ANALYSIS** — When asked about a flow, read the actual code. Don't rely on method names, class names, or pattern matching. Two methods named `resolveTicketProduct` in different classes serve completely different flows.

4. **VALIDATE BOTH PATHS** — Any TEP3 change must be verified in:
   - `DefaultCartService` path (add-to-cart, update/PCM)
   - `CartDataMapper` path (get-cart)
   - `DefaultBoltCartService` path (bolt kit bundle)
   
   Never assume one path covers all flows.

5. **CHECK BEFORE CLAIMING DONE** — Before saying "all changes are correct", trace every affected flow end-to-end. Read the dispatch method, the resolve method, and the downstream helpers. Verify error handling, pricing logic, and availability checks are consistent.

6. **WHEN UNCERTAIN, SAY SO** — If a flow hasn't been traced completely, say "I haven't verified this yet" instead of presenting an assumption as fact.

> This rule exists because cart-service has parallel resolve methods in DefaultCartService (add-to-cart) and CartDataMapper (get-cart). An incorrect assumption about which one is used could lead to changes that pass testing on one flow but fail on another in production.
