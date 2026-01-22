# Technical Resolution Report

This document details the critical issues encountered during the debugging session, the root causes identified in the code, and the specific fixes applied.

## 1. JWT Algorithm Mismatch (HS384 vs HS256)

### The Problem
The API Gateway was rejecting tokens with `invalid_token` (HTTP 401).
- **Auth Service**: Was generating tokens using `HS384` (HmacSHA384). This happened because the `jjwt` library inferred the algorithm based on the key size/default behavior when no algorithm was explicitly specified.
- **API Gateway**: Was configured to expect `HS256` (HmacSHA256).

### The Fix
**File:** `backend/auth-service/src/main/java/com/example/auth/security/JwtTokenProvider.java`

We explicitly enforced the HS256 algorithm in the token generation builder.

```java
// BEFORE
.signWith(getSigningKey(), io.jsonwebtoken.SignatureAlgorithm.HS256) // Was effectively legacy/ambiguous in 0.12.x

// AFTER
.signWith(getSigningKey(), Jwts.SIG.HS256) // Explicitly enforces HS256
```

---

## 2. Weak & Inconsistent Secret Keys

### The Problem
The original secret key was a simple string (`secret-key`), which is not secure for 256-bit encryption. Additionally, services were using inconsistent keys, causing signature validation to fail.

### The Fix
**File:** `application.yml` (All Services)

Generated a secure, 256-bit Base64-encoded secret and applied it uniformly across all services.

```yaml
# AFTER
jwt:
  secret: M/wZlUpJUUTKSwRfDkPgLHCwalDUxt/hEx/tgtaxWoA=
```

---

## 3. Stale Code Deployment (Docker/Maven)

### The Problem
Despite changing the Java code, the fixes were not appearing in the running containers.
- **Cause:** The `Dockerfile` instructions (`COPY target/*.jar app.jar`) copy the *compiled* JAR from the host machine.
- **Issue:** We were restarting Docker containers, but we had not run `mvn package` on the host. The containers were simply copying the old, broken JARs over and over.

### The Fix
Executed the Maven build process before updating Docker containers.

```bash
mvn clean package -DskipTests
docker-compose up -d --build --force-recreate
```

---

## 4. Duplicate CORS Headers

### The Problem
The browser blocked requests with the error:
`The 'Access-Control-Allow-Origin' header contains multiple values 'http://localhost:3000, http://localhost:3000'`

**Cause:**
1. **API Gateway**: Correctly configured to add the CORS header.
2. **Order Service**: *Also* configured to add the CORS header, resulting in duplicates.

### The Fix

**Step 1: Disable CORS Config in Security**
**File:** `backend/order-service/src/main/java/com/example/order/config/SecurityConfig.java`

Removed the CORS configuration source bean and the `.cors()` call from the filter chain.

```java
// REMOVED
.cors(cors -> cors.configurationSource(corsConfigurationSource()))

// AND REMOVED BEAN
public CorsConfigurationSource corsConfigurationSource() { ... }
```

**Step 2: Remove Controller Annotation**
**File:** `backend/order-service/src/main/java/com/example/order/controller/OrderController.java`

Removed the `@CrossOrigin` annotation which forces a wildcard header.

```java
// REMOVED
@CrossOrigin(origins = "*")
public class OrderController { ... }
```

---

## 5. Summary of System Status
- **Authentication**: Fully functional (HS256).
- **Communication**: Gateway successfully relays tokens to downstream services.
- **Browser Security**: CORS is now handled exclusively by the Gateway, resolving browser errors.
