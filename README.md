# Spotify Smaug Checkout

A Java (Spring Boot) and React (TypeScript) simulation demonstrating subscription checkout workflows, deterministic A/B testing, and idempotent payment processing under downstream failure scenarios.

## Architectural Highlights

* **Idempotency Engine:** Prevents double-charging during network retries using header-based key tracking (`X-Idempotency-Key`) backed by `ConcurrentHashMap` storage.
* **Deterministic A/B Testing:** Routes users into `CONTROL` or `VARIANT_B` checkout flows via deterministic hash modulo calculation on `userId`.
* **Fault Injection:** Mimics banking failures (HTTP 402 / Card Decline code `4005`) to validate frontend error handling and recovery flows.

## Tech Stack

* **Backend:** Java 21, Spring Boot 3, REST API
* **Frontend:** TypeScript, React 18, Vite
* **Concepts:** Idempotency, Transactional Reliability, A/B Testing, Defensive State Management

## Quickstart

### 1. Backend
```bash
cd backend
./mvnw spring-boot:run