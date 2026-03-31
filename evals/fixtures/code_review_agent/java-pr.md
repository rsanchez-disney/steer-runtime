---
agent: code_review_agent
name: java-pr
description: Review Java code changes — tests review thoroughness and golden rule compliance
timeout: 300
tags: [dev-core, standard]
---

Review the following Java code change for a new refund validation endpoint:

```java
// RefundValidationController.java
@RestController
@RequestMapping("/api/v1/refunds")
public class RefundValidationController {

    @Autowired
    private RefundService refundService;

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@RequestBody Map<String, Object> request) {
        String chargeId = (String) request.get("chargeId");
        double amount = (double) request.get("amount");

        if (chargeId == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid input"));
        }

        boolean valid = refundService.validateRefund(chargeId, amount);
        return ResponseEntity.ok(Map.of("valid", valid, "chargeId", chargeId));
    }
}
```

Check for: backward compatibility, error handling, input validation, security issues, test coverage, coding standards, and structured logging.
