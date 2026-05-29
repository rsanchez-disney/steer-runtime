# Learnings

### POS-17653 — DayPartConfigurationInteractor
- `DEFAULT_START_TIME = "00:00"` causes `ParseException` in `isTimeStampBetweenDayPartTimes` since `TIME_FORMAT = "HH:mm:ss"` — potential production bug
- End time boundary includes +59 seconds (`END_TIME_FINAL_SECOND = 59`), so timestamps at exact end time are still within range

### POS-17564 — FolioOfflineTipSyncFlow & offline folio flows
- FolioOfflineTipSyncFlow uses CompletableDeferred pattern — emitResult completes the deferred, execute() awaits it
- ChargeTipWithOriginalDiningPaymentFactory is an `object` — needs mockkObject
- `isRetrofitNetworkException` is an extension function on Throwable in NetworkUtils.kt — needs mockkStatic
- `getPaymentIdentifier` is an extension on FolioTenderDescriptor — needs mockkStatic for the extensions file
- SyncOfflineTipFolioInteractor extends SyncOfflineCharge which requires UserManager.getInstance() mock
- FolioOfflineSyncFlow error handling maps FolioException subtypes to FailedValidation, everything else to FailedToSync

### POS-17645 — FolioOfflineMediaSyncFlow unit tests
- `FolioFlowState.Reservation.Offline` is a **data class** with parameter `(val data: Data)` — NOT an object/singleton
- Correct test usage: `FolioFlowState.Reservation.Offline(mockk(relaxed = true))` — cannot use it as a bare expression
- `OfflineChargeResult.Success` is NOT an object singleton — use `assertTrue(result is OfflineChargeResult.Success)` instead of `assertEquals` when the result comes from a mock

### POS-17571 — PaymentUtil.java unit tests
- `PaymentOptionTag` has public Java fields (`paymentOption`, `subpayment`, `tag`) — cannot mock with `every {}`, must use real objects or set fields directly (e.g., `tag.tag = integrationTag`)
- `Subpayment` is an external library interface with `getType()` returning primitive `int` — MockK cannot mock it. Use a concrete class instead
- `PaymentOptionsTender` — use no-arg constructor + `setPaymentOptionTag()` setter, not the parameterized constructor
- SERVER_PAYMENT_TYPE constants (from `RetailConstants`): CREDIT="1", CASH="2", BEACON="6", WRISTBAND="8", STORED_VALUE="11", CUSTOM_TENDER="12"

### POS-18602 — ExternalRestrictionValidator, OrderRetailCartBuilder, SubmitProcessHandler unit tests
- ExternalRestrictionValidatorTest mixes Mockito (`@Mock` + `MockitoAnnotations.initMocks`) and MockK — new tests should use only MockK but coexist in the same file
- `ExternalRestrictionValidator` companion object has private constants (`OFFLINE_APPLY_YES = "1"`, `DECLINE_APPLY_YES = "1"`, `DECLINE_APPLY_APPROVAL = "2"`) — duplicate them in test companion object
- `validateTags` throws `ExternalRestrictionException` with specific `Throwable.message` as cause: `"DeclineApplyYes"`, `"ReferenceTagMismatch"`, `"ReferenceTagMissing"` — assert on `exception.cause?.message`
- `OrderRetailCartBuilderTest` uses Robolectric (`@RunWith(RobolectricTestRunner::class)`, `@Config(application = TestWithDBApplication::class, sdk = [30])`) — required for Room/DB operations
- `OrderRetailCartBuilder` has `@VisibleForTesting` internal methods (`resolveReduction`, `injectRewardValuesIfNeeded`, `applyReductionToCart`, `isParentForAnyCheck`, `isChildForAnyCheck`) — can be tested directly
- `CheckoutCartItemEntity` fields: `weightItem` uses `WEIGHT_ITEM_TAG` constant (int), `openPrice` uses `OPENPRICE_ITEM_TAG` constant (int)
- `SubmitProcessHandler.showProgress()` skips showing progress when `cartProxy.activeCheckData.tabType.isBarTab()` — test by setting `ActiveCheckData(tabType = TabType.BAR_TAB)`
- `ActiveCheckData` has a `NOT_SELECTED_CHECK` constant for when no check is selected
