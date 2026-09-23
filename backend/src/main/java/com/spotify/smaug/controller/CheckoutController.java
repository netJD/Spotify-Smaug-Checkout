package com.spotify.smaug.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    // In-memory cache to simulate idempotency storage (Redis in production)
    private final Map<String, Object> idempotencyStore = new ConcurrentHashMap<>();

    // 1. A/B Experiment: Deterministic assignment by User ID
    @GetMapping("/variant")
    public ResponseEntity<Map<String, String>> getVariant(@RequestParam String userId) {
        String variant = (Math.abs(userId.hashCode()) % 2 == 0) ? "CONTROL" : "VARIANT_B";
        return ResponseEntity.ok(Map.of("userId", userId, "variant", variant));
    }

    // 2. Idempotency & 3. Payment Resilience (Error 4005)
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody Map<String, String> payload) {

        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Header X-Idempotency-Key is required"));
        }

        // Double-charge mitigation: Returns stored response if key was already processed
        if (idempotencyStore.containsKey(idempotencyKey)) {
            System.out.println("[IDEMPOTENCY MATCH] Previous transaction returned for key: " + idempotencyKey);
            return ResponseEntity.ok(idempotencyStore.get(idempotencyKey));
        }

        String cvv = payload.getOrDefault("cardCvv", "");
        String userId = payload.getOrDefault("userId", "unknown");

        // Banking response simulation: Code 4005 (Card Declined / Insufficient Funds)
        if ("4005".equals(cvv)) {
            System.err.println("[LOG GCP-WARN] Card declined by issuing bank. User: " + userId + " | Code: 4005");
            return ResponseEntity.status(402).body(Map.of(
                    "status", "FAILED",
                    "errorCode", "4005",
                    "message", "Card declined due to insufficient funds or issuer block."
            ));
        }

        // Successful Transaction
        Map<String, Object> response = Map.of(
                "status", "SUCCESS",
                "transactionId", "trx_smaug_" + System.currentTimeMillis(),
                "message", "Welcome to Spotify Premium!"
        );

        idempotencyStore.put(idempotencyKey, response);
        System.out.println("[LOG GCP-INFO] Payment processed successfully for User: " + userId);

        return ResponseEntity.ok(response);
    }
}