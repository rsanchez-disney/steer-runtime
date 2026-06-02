# Ordered Message Sequences Per Booking Flow (with JAXB Objects)

## How to Read This Document

Each flow lists messages **in the exact order** they are sent, as orchestrated by the domain layer code. For each message:
- **#** = execution order
- **JAXB RQ/RS** = root element class from the `dlpjaxb.jar` (compiled from XSD)
- **Package** = Java package where the JAXB class lives

All messages include a `MessageHeader` (`com.wdw.eai.foundation.message.MessageHeader`) with conversation ID, message ID, and timestamp.

---

## 1. Room-Only Reservation (New Booking)

**Orchestrator:** `Itinerary.book()` → `bookRoom()` → `sendItineraryCompletionMessages()`

| # | Message | JAXB RQ Object | JAXB RS Object | Package |
|---|---------|----------------|----------------|---------|
| 1 | Logi Room Reservation | `RoomResRQ` | `RoomResRS` | `c.w.e.m.d.book.room` |
| 2 | DPMS Room Reservation | `RoomResRQ` | `RoomResRS` | `c.w.e.m.d.book.room` |
| 3 | Reservation Comments | `ResCommentsRQ` | `ResCommentsRS` | `c.w.e.m.d.comments` |
| 4 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | (itinerary package) |
| 5 | Complete New Reservation | `CompleteNewResRQ` | `CompleteNewResRS` | (book package) |
| 6 | Itinerary Update | `ItineraryUpdateRQ` | `ItineraryUpdateRS` | (modify.itinerary) |
| 7 | Payment | `PaymentRQ` | `PaymentRS` | `c.w.e.m.d.payment` |
| 8 | Itinerary Details (retrieval) | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | (itinerary package) |

**Notes:**
- Steps 1-2: One Logi RoomResRQ per CRS room, one DPMS RoomResRQ for all DPMS rooms.
- Step 3: Only for brand-new reservations with coded comments.
- Step 5: Only sent once per itinerary (first booking). Controlled by `SEND_COMPLETE_NEW_RES` property.
- Step 6: Only if FYR or contact name changed.
- Step 7: Only if payment mode is set (credit card, debit, etc.).
- Step 8: Retrieves the final itinerary state after all updates.

---

## 2. Room + Ticket (LOS Package)

**Orchestrator:** `Itinerary.book()` → `bookRoom()` → `bookOrModifyKttw()` → `sendItineraryCompletionMessages()`

| # | Message | JAXB RQ Object | JAXB RS Object | Package |
|---|---------|----------------|----------------|---------|
| 1 | Logi Room Reservation | `RoomResRQ` | `RoomResRS` | `c.w.e.m.d.book.room` |
| 2 | DPMS Room Reservation | `RoomResRQ` | `RoomResRS` | `c.w.e.m.d.book.room` |
| 3 | Reservation Comments | `ResCommentsRQ` | `ResCommentsRS` | `c.w.e.m.d.comments` |
| 4 | Ticket LOS Reservation | `TicketLOSResRQ` | `TicketLOSResRS` | `c.w.e.m.d.book.ticket` |
| 5 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | (itinerary) |
| 6 | Complete New Reservation | `CompleteNewResRQ` | `CompleteNewResRS` | (book) |
| 7 | Itinerary Update | `ItineraryUpdateRQ` | `ItineraryUpdateRS` | `c.w.e.m.d.modify.itinerary` |
| 8 | Payment | `PaymentRQ` | `PaymentRS` | `c.w.e.m.d.payment` |
| 9 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | (itinerary) |

---

## 3. Room + Ticket + Train (Full Package)

**Orchestrator:** `Itinerary.book()` → `bookRoom()` → `bookOrModifyKttw()` → `ComponentDomain.book()` → `sendItineraryCompletionMessages()`

| # | Message | JAXB RQ Object | JAXB RS Object | Package |
|---|---------|----------------|----------------|---------|
| 1 | Logi Room Reservation | `RoomResRQ` | `RoomResRS` | `c.w.e.m.d.book.room` |
| 2 | DPMS Room Reservation | `RoomResRQ` | `RoomResRS` | `c.w.e.m.d.book.room` |
| 3 | Reservation Comments (room) | `ResCommentsRQ` | `ResCommentsRS` | `c.w.e.m.d.comments` |
| 4 | Ticket LOS Reservation | `TicketLOSResRQ` | `TicketLOSResRS` | `c.w.e.m.d.book.ticket` |
| 5 | Transport Reservation | `TransportResRQ` | `TransportResRS` | `c.w.e.m.d.book.transport` |
| 6 | Reservation Comments (components) | `ResCommentsRQ` | `ResCommentsRS` | `c.w.e.m.d.comments` |
| 7 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | (itinerary) |
| 8 | Complete New Reservation | `CompleteNewResRQ` | `CompleteNewResRS` | (book) |
| 9 | Itinerary Update | `ItineraryUpdateRQ` | `ItineraryUpdateRS` | `c.w.e.m.d.modify.itinerary` |
| 10 | Payment | `PaymentRQ` | `PaymentRS` | `c.w.e.m.d.payment` |
| 11 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | (itinerary) |

---

## 4. Room + Ticket + Air (Flight Package)

| # | Message | JAXB RQ Object | JAXB RS Object | Package |
|---|---------|----------------|----------------|---------|
| 1 | Logi Room Reservation | `RoomResRQ` | `RoomResRS` | `c.w.e.m.d.book.room` |
| 2 | DPMS Room Reservation | `RoomResRQ` | `RoomResRS` | `c.w.e.m.d.book.room` |
| 3 | Reservation Comments (room) | `ResCommentsRQ` | `ResCommentsRS` | `c.w.e.m.d.comments` |
| 4 | Ticket LOS Reservation | `TicketLOSResRQ` | `TicketLOSResRS` | `c.w.e.m.d.book.ticket` |
| 5 | Air Reservation | `AirResRQ` | `AirResRS` | `c.w.e.m.d.book.air` |
| 6 | Air Reservation Remarks | `AirResRemarksRQ` | `AirResRemarksRS` | (book.air) |
| 7 | Reservation Comments (components) | `ResCommentsRQ` | `ResCommentsRS` | `c.w.e.m.d.comments` |
| 8 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | (itinerary) |
| 9 | Complete New Reservation | `CompleteNewResRQ` | `CompleteNewResRS` | (book) |
| 10 | Payment | `PaymentRQ` | `PaymentRS` | `c.w.e.m.d.payment` |
| 11 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | (itinerary) |

---

## 5. Full Package (Room + Ticket + Train + Misc + Insurance)

The maximum message sequence for a full DLP package booking:

| # | Message | JAXB RQ Object | JAXB RS Object | Package |
|---|---------|----------------|----------------|---------|
| 1 | Logi Room Reservation | `RoomResRQ` | `RoomResRS` | `c.w.e.m.d.book.room` |
| 2 | DPMS Room Reservation | `RoomResRQ` | `RoomResRS` | `c.w.e.m.d.book.room` |
| 3 | Reservation Comments (room) | `ResCommentsRQ` | `ResCommentsRS` | `c.w.e.m.d.comments` |
| 4 | Ticket LOS Reservation | `TicketLOSResRQ` | `TicketLOSResRS` | `c.w.e.m.d.book.ticket` |
| 5 | Misc Reservation (DEX, meals) | `MiscResRQ` | `MiscResRS` | `c.w.e.m.d.book.misc` |
| 6 | Transport Reservation (train) | `TransportResRQ` | `TransportResRS` | `c.w.e.m.d.book.transport` |
| 7 | Insurance Reservation | `MiscResRQ`* | `MiscResRS`* | `c.w.e.m.d.book.misc` |
| 8 | Vehicle Reservation (if car) | `VehicleResRQ` | `VehicleResRS` | `c.w.e.m.d.book.vehicle` |
| 9 | Transfer Reservation (if shuttle) | `TransferComponentRQ` | `TransferComponentRS` | `c.w.e.m.d.dge` |
| 10 | Reservation Comments (coded) | `ResCommentsRQ` | `ResCommentsRS` | `c.w.e.m.d.comments` |
| 11 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | (itinerary) |
| 12 | Complete New Reservation | `CompleteNewResRQ` | `CompleteNewResRS` | (book) |
| 13 | Itinerary Update | `ItineraryUpdateRQ` | `ItineraryUpdateRS` | `c.w.e.m.d.modify.itinerary` |
| 14 | Payment | `PaymentRQ` | `PaymentRS` | `c.w.e.m.d.payment` |
| 15 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | (itinerary) |

*Insurance in DLP uses `MiscResRQ` (not `InsuranceResRQ`) — the component type is changed before sending.*

**Component booking order within `ComponentDomain.book()`:**
1. Air (AirResRQ + AirResRemarksRQ)
2. Miscellaneous (MiscResRQ) — includes DEX, meal plans, etc.
3. Train/Transport (TransportResRQ)
4. Insurance (sent as MiscResRQ)
5. Car (VehicleResRQ)
6. Transfer (TransferComponentRQ)
7. DGE (TransferComponentRQ)

---

## 6. Add-On to Existing Reservation (Component Only)

When adding a component to an already-confirmed reservation, only the component + notes are sent:

### Add Miscellaneous (DEX, Meal Plan, etc.)

| # | Message | JAXB RQ Object | JAXB RS Object |
|---|---------|----------------|----------------|
| 1 | Misc Reservation | `MiscResRQ` | `MiscResRS` |
| 2 | Reservation Comments | `ResCommentsRQ` | `ResCommentsRS` |
| 3 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` |
| 4 | Payment (if applicable) | `PaymentRQ` | `PaymentRS` |
| 5 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` |

### Add Transport/Train

| # | Message | JAXB RQ Object | JAXB RS Object |
|---|---------|----------------|----------------|
| 1 | Transport Reservation | `TransportResRQ` | `TransportResRS` |
| 2 | Reservation Comments | `ResCommentsRQ` | `ResCommentsRS` |
| 3 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` |
| 4 | Payment (if applicable) | `PaymentRQ` | `PaymentRS` |
| 5 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` |

### Add Insurance

| # | Message | JAXB RQ Object | JAXB RS Object |
|---|---------|----------------|----------------|
| 1 | Insurance (as Misc) | `MiscResRQ` | `MiscResRS` |
| 2 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` |
| 3 | Payment (if applicable) | `PaymentRQ` | `PaymentRS` |
| 4 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` |

### Add Transfer/Shuttle

| # | Message | JAXB RQ Object | JAXB RS Object |
|---|---------|----------------|----------------|
| 1 | Transfer Component | `TransferComponentRQ` | `TransferComponentRS` |
| 2 | Reservation Comments | `ResCommentsRQ` | `ResCommentsRS` |
| 3 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` |
| 4 | Payment (if applicable) | `PaymentRQ` | `PaymentRS` |
| 5 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` |

### Add Vehicle/Car

| # | Message | JAXB RQ Object | JAXB RS Object |
|---|---------|----------------|----------------|
| 1 | Vehicle Reservation | `VehicleResRQ` | `VehicleResRS` |
| 2 | Reservation Comments | `ResCommentsRQ` | `ResCommentsRS` |
| 3 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` |
| 4 | Payment (if applicable) | `PaymentRQ` | `PaymentRS` |
| 5 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` |

---

## 7. Full Itinerary Cancellation

**Orchestrator:** `ItineraryCancel.cancelItinerary()`

| # | Message | JAXB RQ Object | JAXB RS Object | Package |
|---|---------|----------------|----------------|---------|
| 1 | Cancellation Penalty Query | `CancellationPenaltyQueryRQ` | `CancellationPenaltyQueryRS` | (cancellation) |
| 2 | Itinerary Cancel | `ItineraryCancelRQ` | `ItineraryCancelRS` | (itinerary) |
| 3 | Payment (refund) | `PaymentRQ` | `PaymentRS` | `c.w.e.m.d.payment` |
| 4 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | (itinerary) |
| 5 | Itinerary Confirmation | `ItineraryConfirmationRQ` | `ItineraryConfirmationRS` | (itinerary) |

**Notes:**
- Step 1 is optional (only shown to agent for penalty display).
- Step 3 is only sent if a refund is due.
- Step 5 sends cancellation confirmation letter to guest.

---

## 8. Single Component Cancellation

**Orchestrator:** `ItineraryCancel.cancelComponent()`

| # | Message | JAXB RQ Object | JAXB RS Object | Package |
|---|---------|----------------|----------------|---------|
| 1 | Cancellation Penalty Query | `CancellationPenaltyQueryRQ` | `CancellationPenaltyQueryRS` | (cancellation) |
| 2 | Component Cancel | `ComponentCancelRQ` | `ComponentCancelRS` | (component cancel) |
| 3 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | (itinerary) |
| 4 | Payment (refund if applicable) | `PaymentRQ` | `PaymentRS` | `c.w.e.m.d.payment` |
| 5 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | (itinerary) |

---

## 9. Room Modification (Acco-Edit / Rebook)

When a guest modifies their room (dates, room type, package change):

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Component Cancel (old room) | `ComponentCancelRQ` | `ComponentCancelRS` | Cancel existing room |
| 2 | Logi Room Reservation (new) | `RoomResRQ` | `RoomResRS` | Book new room config |
| 3 | DPMS Room Reservation (new) | `RoomResRQ` | `RoomResRS` | Sync new room to DPMS |
| 4 | Reservation Comments | `ResCommentsRQ` | `ResCommentsRS` | Update comments |
| 5 | Ticket LOS Reservation (if changed) | `TicketLOSResRQ` | `TicketLOSResRS` | Rebook tickets |
| 6 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | Update notes |
| 7 | Itinerary Update | `ItineraryUpdateRQ` | `ItineraryUpdateRS` | Update FYR/contact |
| 8 | Payment (price difference) | `PaymentRQ` | `PaymentRS` | Collect/refund diff |
| 9 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | Refresh state |

---

## 10. Guest Information Modification

When updating guest details on an existing reservation:

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Modify Guest Info | `ModifyGuestInfoRQ` | `ModifyGuestInfoRS` | Update name/address/phone |
| 2 | DPMS WHO Update | `RoomResRQ`* | `RoomResRS`* | Sync guest to DPMS |
| 3 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | Log change |
| 4 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | Refresh |

*DPMS sync reuses the room booking message type with special flags.*

---

## 11. Air Modification

### Change Flight

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Get Flight List | `GetFlightListRQ` | `GetFlightListRS` | Available alternatives |
| 2 | Get Flight Price Detail | `GetFlightPriceDetailRQ` | `GetFlightPriceDetailRS` | New flight pricing |
| 3 | Confirm Flight Change | `ConfirmFlightChangeRQ` | `ConfirmFlightChangeRS` | Confirm the change |
| 4 | Air Reservation Remarks | `AirResRemarksRQ` | `AirResRemarksRS` | Update PNR |
| 5 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | Log change |
| 6 | Payment (fare difference) | `PaymentRQ` | `PaymentRS` | Collect/refund |
| 7 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | Refresh |

### Change Passenger Info

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Modify Air Pax Info | `ModifyPaxInfoRQ` | `ModifyPaxInfoRS` | Update passenger details |
| 2 | Air Reservation Remarks | `AirResRemarksRQ` | `AirResRemarksRS` | Update PNR remarks |

### Change Seat Assignment

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Modify Seat Assignment | `ModifySeatAssignmentsRQ` | `ModifySeatAssignmentsRS` | New seat selection |

---

## 12. Discovery & Quoting Flow (Pre-Booking)

Before booking, the agent goes through discovery/quoting. These are independent request-response pairs:

### Offer Discovery

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Offer Template Query | `OfferTemplateQueryRQ` | `OfferTemplateQueryRS` | Load templates for market |
| 2 | Offer Query | `OfferQueryRQ` | `OfferQueryRS` | Search matching offers |

### Room Availability & Pricing

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Room Availability | `RoomAvailabilityRQ` | `RoomAvailabilityRS` | Available rooms |
| 2 | Room Quote | `RoomQuoteRQ` | `RoomQuoteRS` | Room pricing |
| 3 | Ticket LOS Quote | `TicketLOSQuoteRQ` | `TicketLOSQuoteRS` | Ticket pricing |
| 4 | Room Inventory Decrement | `RoomInventoryDecrementRQ` | `RoomInventoryDecrementRS` | Hold room |
| 5 | Package PIN Query | `PackagePinQueryRQ` | `PackagePinQueryRS` | Validate promo code |

### Transport Availability & Pricing

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Transport Availability | `TransportAvailabilityRQ` | `TransportAvailabilityRS` | Available trains |
| 2 | Transport Quote | `TransportQuoteRQ` | `TransportQuoteRS` | Train pricing |

### Air Availability & Pricing

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Air Availability | `AirAvailabilityRQ` | `AirAvailabilityRS` | Available flights |
| 2 | Air Quote | `AirQuoteRQ` | `AirQuoteRS` | Flight pricing |

### Misc/Insurance/Transfer/Vehicle Availability & Pricing

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Misc Availability | `MiscAvailabilityRQ` | `MiscAvailabilityRS` | Available add-ons |
| 2 | Misc Quote | `MiscQuoteRQ` | `MiscQuoteRS` | Add-on pricing |
| 3 | Insurance Availability | `InsuranceAvailabilityRQ` | `InsuranceAvailabilityRS` | Insurance options |
| 4 | Insurance Quote | `InsuranceQuoteRQ` | `InsuranceQuoteRS` | Insurance pricing |
| 5 | Vehicle Availability | `VehicleAvailabilityRQ` | `VehicleAvailabilityRS` | Car options |
| 6 | Vehicle Quote | `VehicleQuoteRQ` | `VehicleQuoteRS` | Car pricing |
| 7 | Transfer Availability | `TransferComponentRQ` | `TransferComponentRS` | Transfer options |
| 8 | Transfer Quote | `TransferComponentRQ` | `TransferComponentRS` | Transfer pricing |

---

## 13. Itinerary Retrieval

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Itinerary Query (search) | `ItineraryQueryRQ` | `ItineraryQueryRS` | Find by criteria |
| 2 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | Full itinerary data |
| 3 | Household Details | `HouseholdDetailsRQ` | `HouseholdDetailsRS` | Guest household |
| 4 | Organization Details | `OrganizationDetailsRQ` | `OrganizationDetailsRS` | Agency profile |
| 5 | Balance Inquiry | `BalanceInquiryRQ` | `BalanceInquiryRS` | Payment balance |

---

## 14. Send Confirmation (Post-Booking)

**Orchestrator:** `Itinerary.sendItinConfirmation()`

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Itinerary Confirmation (Logi) | `ItineraryConfirmationRQ` | `ItineraryConfirmationRS` | Send to CRS guests |
| 2 | Itinerary Confirmation (DPMS) | `ItineraryConfirmationRQ` | `ItineraryConfirmationRS` | Send to DPMS guests |

---

## 15. Travel Wish Creation

| # | Message | JAXB RQ Object | JAXB RS Object | Package |
|---|---------|----------------|----------------|---------|
| 1 | Travel Wish | `TravelWishRQ` | `TravelWishRS` | `c.w.e.m.d.travelwish` |

After TW is booked (converted to reservation), `TWUtil.convertTWtoBooked()` updates the TW state in TPSS database (no EAI message).

---

## 16. Payment-Only Transaction

| # | Message | JAXB RQ Object | JAXB RS Object | Purpose |
|---|---------|----------------|----------------|---------|
| 1 | Balance Inquiry | `BalanceInquiryRQ` | `BalanceInquiryRS` | Get current balance |
| 2 | Payment | `PaymentRQ` | `PaymentRS` | Process payment |
| 3 | Itinerary Notes (debit card) | `ItineraryNotesRQ` | `ItineraryNotesRS` | Log card details |
| 4 | Itinerary Details | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | Refresh |

---

## Key Ordering Rules

1. **Room always first** — Logi rooms create the itinerary key (ParentId) needed by all subsequent messages.
2. **DPMS after Logi** — DPMS room syncs after CRS room is confirmed.
3. **Tickets after rooms** — LOS tickets reference the room's itinerary key.
4. **Components in fixed order** — Air → Misc → Train → Insurance → Car → Transfer → DGE.
5. **Comments after booking** — Coded comments for rooms are sent after the room is confirmed.
6. **CompleteNewRes once** — Only sent for the first booking in an itinerary's lifecycle.
7. **Notes before payment** — Internal notes are written before payment processing.
8. **Payment can rollback** — If payment fails on a new reservation, the entire reservation is rolled back.
9. **ItineraryDetails last** — Always the final message to retrieve the committed state.

---

## JAXB Package Reference

| Abbreviation | Full Package |
|--------------|-------------|
| `c.w.e.m.d.book.room` | `com.wdw.eai.message.domain.book.room` |
| `c.w.e.m.d.book.air` | `com.wdw.eai.message.domain.book.air` |
| `c.w.e.m.d.book.transport` | `com.wdw.eai.message.domain.book.transport` |
| `c.w.e.m.d.book.ticket` | `com.wdw.eai.message.domain.book.ticket` |
| `c.w.e.m.d.book.misc` | `com.wdw.eai.message.domain.book.misc` |
| `c.w.e.m.d.book.insurance` | `com.wdw.eai.message.domain.book.insurance` |
| `c.w.e.m.d.book.vehicle` | `com.wdw.eai.message.domain.book.vehicle` |
| `c.w.e.m.d.availability.room` | `com.wdw.eai.message.domain.availability.room` |
| `c.w.e.m.d.availability.air` | `com.wdw.eai.message.domain.availability.air` |
| `c.w.e.m.d.availability.transport` | `com.wdw.eai.message.domain.availability.transport` |
| `c.w.e.m.d.availability.misc` | `com.wdw.eai.message.domain.availability.misc` |
| `c.w.e.m.d.availability.insurance` | `com.wdw.eai.message.domain.availability.insurance` |
| `c.w.e.m.d.availability.vehicle` | `com.wdw.eai.message.domain.availability.vehicle` |
| `c.w.e.m.d.quote.room` | `com.wdw.eai.message.domain.quote.room` |
| `c.w.e.m.d.quote.air` | `com.wdw.eai.message.domain.quote.air` |
| `c.w.e.m.d.quote.misc` | `com.wdw.eai.message.domain.quote.misc` |
| `c.w.e.m.d.quote.insurance` | `com.wdw.eai.message.domain.quote.insurance` |
| `c.w.e.m.d.modify.air` | `com.wdw.eai.message.domain.modify.air` |
| `c.w.e.m.d.modify.itinerary` | `com.wdw.eai.message.domain.modify.itinerary` |
| `c.w.e.m.d.payment` | `com.wdw.eai.message.domain.payment` |
| `c.w.e.m.d.comments` | `com.wdw.eai.message.domain.comments` |
| `c.w.e.m.d.dge` | `com.wdw.eai.message.domain.dge` |
| `c.w.e.m.d.travelwish` | `com.wdw.eai.message.domain.travelwish` |
| `c.w.e.m.d.profile` | `com.wdw.eai.message.domain.profile` |
| `c.w.e.m.d.session` | `com.wdw.eai.message.domain.session` |
| `c.w.e.foundation.message` | `com.wdw.eai.foundation.message` (MessageHeader, ResultsInfo) |

---

## 17. Complete End-to-End Flow: From OfferQuery to Confirmed Reservation

This is the **full ordered sequence** from when the agent starts discovery until the reservation is confirmed, showing every message exchanged with backend systems.

### Phase 1: Discovery & Offer Selection

| # | Message | JAXB RQ | JAXB RS | Trigger |
|---|---------|---------|---------|---------|
| 1 | Offer Template Query | `OfferTemplateQueryRQ` | `OfferTemplateQueryRS` | Agent enters discovery (first time or cache miss) |
| 2 | Offer Query | `OfferQueryRQ` | `OfferQueryRS` | Agent submits preferences (dates, hotel, party) |

**What happens:** The OfferTemplateQuery loads the configuration for the market/channel. The OfferQuery (`SBCRecommender.invokeRecommenderAndPatchResults()`) sends preferences to the recommender engine which returns `BridgeSummaryItemList` — a list of matching packages with facility, room types, and combinability flags.

### Phase 2: Room Availability & Quoting

| # | Message | JAXB RQ | JAXB RS | Trigger |
|---|---------|---------|---------|---------|
| 3 | Room Availability | `RoomAvailabilityRQ` | `RoomAvailabilityRS` | Agent selects an offer to quote |
| 4 | Room Quote | `RoomQuoteRQ` | `RoomQuoteRS` | System auto-quotes after availability |
| 5 | Package PIN Query | `PackagePinQueryRQ` | `PackagePinQueryRS` | If promo code is provided |
| 6 | PCS: validateCombinableProducts | (REST/JSON) | `ProductResultSet` | PCS validates offer compatibility |

**What happens:** `GeneralOffer.sendReceiveRoomAvail()` checks room availability. Then `LogiOffer` calls `RoomQuoteAdaptor` to get deposit and party pricing. PCS validates the selected package is combinable with other components.

### Phase 3: Freeze (Room Hold)

| # | Message | JAXB RQ | JAXB RS | Trigger |
|---|---------|---------|---------|---------|
| 7 | Room Inventory Decrement | `RoomInventoryDecrementRQ` | `RoomInventoryDecrementRS` | Agent freezes (holds) the offer |

**What happens:** `OfferHandlerWeb.freeze()` → `incrementDecrementOffer()` decrements inventory to hold the room for the agent while completing the booking.

### Phase 4: Add-On Discovery (Optional)

These happen in parallel/independently as the agent adds components:

| # | Message | JAXB RQ | JAXB RS | Trigger |
|---|---------|---------|---------|---------|
| 8 | Transport Availability | `TransportAvailabilityRQ` | `TransportAvailabilityRS` | Agent goes to transport screen |
| 9 | Transport Quote | `TransportQuoteRQ` | `TransportQuoteRS` | Agent selects a train |
| 10 | Misc Availability | `MiscAvailabilityRQ` | `MiscAvailabilityRS` | Agent goes to add-ons screen |
| 11 | Misc Quote | `MiscQuoteRQ` | `MiscQuoteRS` | Agent selects an add-on |
| 12 | Insurance Availability | `InsuranceAvailabilityRQ` | `InsuranceAvailabilityRS` | Agent goes to insurance |
| 13 | Insurance Quote | `InsuranceQuoteRQ` | `InsuranceQuoteRS` | Agent selects a policy |
| 14 | PCS: getCombinableProducts | (REST/JSON) | `ProductSet` | PCS filters available products |

### Phase 5: Confirm All (Booking)

| # | Message | JAXB RQ | JAXB RS | Trigger |
|---|---------|---------|---------|---------|
| 15 | PCS: validateCombinableProducts | (REST/JSON) | `ProductResultSet` | ConfirmAll button pressed |

**What happens:** `ConfirmAllAction` validates all products via PCS (`CONFIRMALL_EVENT`). If conflicts exist, popup alerts are shown. Agent acknowledges and proceeds.

### Phase 6: Reservation Creation

Triggered by `ItinHandlerWeb.executeBook()` → `Itinerary.book()`:

| # | Message | JAXB RQ | JAXB RS | Trigger |
|---|---------|---------|---------|---------|
| 16 | Logi Room Reservation | `RoomResRQ` | `RoomResRS` | Creates CRS reservation |
| 17 | DPMS Room Reservation | `RoomResRQ` | `RoomResRS` | Syncs to DPMS |
| 18 | Reservation Comments | `ResCommentsRQ` | `ResCommentsRS` | Coded comments for room |
| 19 | Ticket LOS Reservation | `TicketLOSResRQ` | `TicketLOSResRS` | If ticket included |
| 20 | Misc Reservation | `MiscResRQ` | `MiscResRS` | If DEX/meals selected |
| 21 | Transport Reservation | `TransportResRQ` | `TransportResRS` | If train selected |
| 22 | Insurance Reservation | `MiscResRQ`* | `MiscResRS`* | If insurance selected |
| 23 | Reservation Comments (coded) | `ResCommentsRQ` | `ResCommentsRS` | PCS coded comments |

*Insurance uses MiscResRQ in DLP.*

### Phase 7: Completion & Payment

| # | Message | JAXB RQ | JAXB RS | Trigger |
|---|---------|---------|---------|---------|
| 24 | Itinerary Notes | `ItineraryNotesRQ` | `ItineraryNotesRS` | Internal + system notes |
| 25 | Complete New Reservation | `CompleteNewResRQ` | `CompleteNewResRS` | Finalizes in CRS |
| 26 | Itinerary Update | `ItineraryUpdateRQ` | `ItineraryUpdateRS` | FYR, contact name |
| 27 | Payment | `PaymentRQ` | `PaymentRS` | Deposit/full payment |
| 28 | Itinerary Details (final) | `ItineraryDetailsRQ` | `ItineraryDetailsRS` | Retrieves committed state |

### Phase 8: Confirmation

| # | Message | JAXB RQ | JAXB RS | Trigger |
|---|---------|---------|---------|---------|
| 29 | Itinerary Confirmation | `ItineraryConfirmationRQ` | `ItineraryConfirmationRS` | Sends booking confirmation to guest |

### Phase 9: Travel Wish Conversion (if from TW)

| # | Message | JAXB RQ | JAXB RS | Trigger |
|---|---------|---------|---------|---------|
| 30 | TW state → BOOKED | (DB update, no EAI) | — | `TWUtil.convertTWtoBooked()` |

---

### Summary: Minimum Messages for Room-Only (from OfferQuery)

For the simplest case (no add-ons, no promo, no TW):

```
1.  OfferTemplateQueryRQ/RS     ← Load discovery config
2.  OfferQueryRQ/RS             ← Get matching offers
3.  RoomAvailabilityRQ/RS       ← Check availability
4.  RoomQuoteRQ/RS              ← Get pricing
5.  RoomInventoryDecrementRQ/RS ← Hold room
6.  PCS validateCombinableProducts (REST)
7.  RoomResRQ/RS (Logi)         ← Book in CRS
8.  RoomResRQ/RS (DPMS)         ← Sync to DPMS
9.  ItineraryNotesRQ/RS         ← Write notes
10. CompleteNewResRQ/RS          ← Finalize
11. PaymentRQ/RS                ← Take deposit
12. ItineraryDetailsRQ/RS       ← Refresh final state
13. ItineraryConfirmationRQ/RS  ← Send to guest
```

### Summary: Full Package (Room + Ticket + Train + DEX)

```
1.  OfferTemplateQueryRQ/RS
2.  OfferQueryRQ/RS
3.  RoomAvailabilityRQ/RS
4.  RoomQuoteRQ/RS
5.  RoomInventoryDecrementRQ/RS
6.  TransportAvailabilityRQ/RS
7.  TransportQuoteRQ/RS
8.  MiscAvailabilityRQ/RS
9.  MiscQuoteRQ/RS
10. PCS validateCombinableProducts (REST)
11. PCS getCombinableProducts (REST)
12. RoomResRQ/RS (Logi)
13. RoomResRQ/RS (DPMS)
14. ResCommentsRQ/RS
15. TicketLOSResRQ/RS
16. MiscResRQ/RS (DEX)
17. TransportResRQ/RS
18. ResCommentsRQ/RS (coded)
19. ItineraryNotesRQ/RS
20. CompleteNewResRQ/RS
21. ItineraryUpdateRQ/RS
22. PaymentRQ/RS
23. ItineraryDetailsRQ/RS
24. ItineraryConfirmationRQ/RS
```
