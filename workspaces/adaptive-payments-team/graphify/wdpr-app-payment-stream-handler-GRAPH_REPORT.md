# Graph Report

**Nodes:** 19 | **Edges:** 72 | **Communities:** 6

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 0 | src/main | 3 |
| 1 | src/main | 3 |
| 2 | src/main | 2 |
| 3 | src/main | 5 |
| 4 | src/main | 4 |
| 5 | src/main | 2 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| src/main/java/com/wdpr/payment/stream/component/PaymentStreamProcessor.java | 21 | 0 | 21 |
| src/main/java/com/wdpr/payment/dynamodb/handler/PaymentStreamHandler.java | 21 | 0 | 21 |
| src/main/java/com/wdpr/payment/stream/component/PaymentStreamModule.java | 18 | 0 | 18 |
| src/main/java/com/wdpr/payment/sns/client/RecordPublisher.java | 8 | 0 | 8 |
| src/main/java/com/wdpr/payment/stream/component/PaymentStreamComponent.java | 3 | 0 | 3 |
| RecordPublisher | 1 | 1 | 0 |
| getRecordPublisher | 1 | 1 | 0 |
| PaymentStreamComponent | 1 | 1 | 0 |
| handleRequest | 1 | 1 | 0 |
| PaymentStreamModule | 1 | 1 | 0 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

No cross-community imports detected.

## Suggested Questions

Questions this graph can help answer:

- What depends on `src/main/java/com/wdpr/payment/stream/component/PaymentStreamProcessor.java` and what breaks if it changes?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
