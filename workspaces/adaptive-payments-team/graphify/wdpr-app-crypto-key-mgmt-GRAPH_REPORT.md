# Graph Report

**Nodes:** 41 | **Edges:** 174 | **Communities:** 10

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 2 | src/main | 2 |
| 3 | src/main | 20 |
| 4 | src/main | 2 |
| 5 | src/test | 2 |
| 0 | src/main | 2 |
| 6 | src/test | 3 |
| 7 | src/test | 2 |
| 8 | src/test | 2 |
| 9 | src/test | 2 |
| 1 | src/main | 4 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| src/main/java/com/wdpr/payment/crypto/service/KMSService.java | 55 | 0 | 55 |
| src/test/java/com/wdpr/payment/crypto/service/KMSServiceTest.java | 42 | 0 | 42 |
| src/test/java/com/wdpr/payment/crypto/keymanager/KeyManagerTest.java | 36 | 0 | 36 |
| src/main/java/com/wdpr/payment/crypto/keymanager/KeyManager.java | 22 | 0 | 22 |
| src/test/java/com/wdpr/payment/crypto/exception/BadRequestExceptionTest.java | 5 | 0 | 5 |
| src/main/java/com/wdpr/payment/crypto/vo/PublicKeyResponse.java | 5 | 0 | 5 |
| src/test/java/com/wdpr/payment/crypto/vo/PublicKeyResponseTest.java | 4 | 0 | 4 |
| src/test/java/com/wdpr/payment/crypto/properties/EnvPropertiesTest.java | 3 | 0 | 3 |
| initialClients | 1 | 1 | 0 |
| setValueToCache | 1 | 1 | 0 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

No cross-community imports detected.

## Suggested Questions

Questions this graph can help answer:

- What depends on `src/main/java/com/wdpr/payment/crypto/service/KMSService.java` and what breaks if it changes?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
