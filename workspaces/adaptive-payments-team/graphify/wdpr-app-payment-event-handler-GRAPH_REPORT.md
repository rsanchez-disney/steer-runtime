# Graph Report

**Nodes:** 102 | **Edges:** 578 | **Communities:** 35

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 0 | src/main | 2 |
| 3 | src/main | 3 |
| 7 | src/main | 3 |
| 32 | src/main | 2 |
| 1 | src/main | 2 |
| 5 | src/main | 3 |
| 8 | src/main | 3 |
| 10 | src/main | 3 |
| 33 | src/main | 2 |
| 4 | src/main | 3 |
| 6 | src/main | 3 |
| 17 | src/main | 2 |
| 21 | src/main | 2 |
| 22 | src/main | 4 |
| 29 | src/main | 2 |
| 2 | src/main | 16 |
| 14 | src/main | 2 |
| 19 | src/main | 2 |
| 20 | src/main | 2 |
| 23 | src/main | 2 |
| 11 | src/main | 3 |
| 12 | src/main | 3 |
| 15 | src/main | 2 |
| 31 | src/main | 2 |
| 18 | src/main | 2 |
| 25 | src/main | 6 |
| 26 | src/main | 2 |
| 27 | src/main | 2 |
| 30 | src/main | 2 |
| 34 | src/main | 3 |
| 9 | src/main | 3 |
| 16 | src/main | 2 |
| 13 | src/main | 3 |
| 24 | src/main | 2 |
| 28 | src/main | 2 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| src/main/java/com/wdpr/payment/event/component/PaymentEventModule.java | 56 | 0 | 56 |
| src/main/java/com/wdpr/payment/event/dao/SettlementHistoryRecordDAO.java | 28 | 0 | 28 |
| src/main/java/com/wdpr/payment/event/dao/FinalizeRecordDAO.java | 27 | 0 | 27 |
| src/main/java/com/wdpr/payment/event/dao/AcknowledgeRecordDAO.java | 26 | 0 | 26 |
| src/main/java/com/wdpr/payment/event/component/PaymentEventProcessor.java | 26 | 0 | 26 |
| src/main/java/com/wdpr/payment/event/dao/mapper/TransactionRecordMapper.java | 26 | 0 | 26 |
| src/main/java/com/wdpr/payment/event/dao/TransactionRecordDAO.java | 24 | 0 | 24 |
| src/main/java/com/wdpr/payment/event/dao/SettlementHistAndArchRecordDAO.java | 23 | 0 | 23 |
| src/main/java/com/wdpr/payment/event/dao/WalletRecordDAO.java | 23 | 0 | 23 |
| src/main/java/com/wdpr/payment/event/dao/PostChargeRecordDAO.java | 23 | 0 | 23 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

No cross-community imports detected.

## Suggested Questions

Questions this graph can help answer:

- What depends on `src/main/java/com/wdpr/payment/event/component/PaymentEventModule.java` and what breaks if it changes?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
