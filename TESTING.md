# Testing & Verification Guide

## Automated Testing

### 1. Backend Integration Tests

Run all backend tests:
```bash
cd backend
mvn test
```

> **Note for Mac Users:** If you get "Could not find a valid Docker environment" error with Testcontainers:
> 1. Ensure Docker Desktop is running
> 2. Try: `export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock`
> 3. Or skip integration tests: `mvn test -DskipITs`
> 
> GitHub Actions CI will run these tests automatically with proper Docker setup.

#### Auth Service Tests
- `AuthServiceIntegrationTest` - Tests registration, login, JWT generation
  - ✅ User registration
  - ✅ JWT token generation on login
  - ✅ Invalid credentials rejection
  - ✅ Duplicate username rejection

#### Order Service Tests
- `OrderServiceIntegrationTest` - Tests order creation with Kafka
  - ✅ Create order and publish to Kafka
  - ✅ Event stored in outbox
  - ✅ Kafka consumer receives event

### 2. End-to-End Authentication Test

Run the automated bash script:
```bash
./test-auth.sh
```

This tests:
1. ✅ User registration
2. ✅ User login & JWT token retrieval
3. ✅ Creating order with valid JWT
4. ✅ Rejecting request without JWT (401/403)
5. ✅ Retrieving order with JWT
6. ✅ Rejecting invalid credentials

### 3. Frontend Testing

#### Manual Testing Steps:

1. **Start the system:**
   ```bash
   docker compose up -d
   ```

2. **Open browser to http://localhost:3000**
   - Should redirect to `/login`

3. **Register a new user:**
   - Navigate to `/register`
   - Fill in: username, email, password
   - Submit → Should auto-login and redirect to dashboard

4. **Verify dashboard:**
   - ✅ Username displayed in header
   - ✅ Roles displayed (should show `ROLE_USER`)
   - ✅ Can create orders
   - ✅ Orders appear in list

5. **Test logout:**
   - Click "Logout" button
   - Should redirect to `/login`
   - Verify token cleared (check localStorage)

6. **Test protected routes:**
   - Try accessing `/` without login
   - Should redirect to `/login`

## Role-Based Access Testing

### Test Admin Role

1. **Create user and assign ADMIN role:**
   ```bash
   # Connect to PostgreSQL
   docker exec -it kafka-postgres-1 psql -U user -d auth_db

   # Assign ADMIN role to user
   INSERT INTO user_roles (user_id, role_id) 
   SELECT u.id, r.id 
   FROM users u, roles r 
   WHERE u.username = 'testuser' AND r.name = 'ROLE_ADMIN';
   ```

2. **Login again:**
   - Logout from frontend
   - Login with same credentials
   - Check header - should show both roles

3. **Verify access:**
   - Should still be able to create orders
   - JWT payload should include both roles

### Test MANAGER Role

Same process but with `ROLE_MANAGER`.

## Token Expiration Testing

JWT tokens expire after 24 hours. To test expiration:

### Manual Test:
1. Login and save the token
2. Change JWT expiration in `application.yml`:
   ```yaml
   jwt:
     expiration: 5000  # 5 seconds
   ```
3. Restart auth-service
4. Register/Login
5. Wait 6 seconds
6. Try to create order → Should get 401

### Automated Test:
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:8086/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# Wait for expiration (if configured to 5s)
sleep 6

# Try to use expired token
curl -X POST http://localhost:8081/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"C1","totalAmount":100,"currency":"USD","items":[{"productId":"P1","quantity":1}]}'

# Should return 401 Unauthorized
```

## Security Verification

### 1. Password Encryption
Check that passwords are encrypted in database:
```bash
docker exec -it kafka-postgres-1 psql -U user -d auth_db

SELECT username, password FROM users;
```

Password should be BCrypt hash starting with `$2a$` or `$2b$`.

### 2. JWT Signature Verification
Try to modify JWT token:
```bash
# Get valid token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Modify payload (change username)
MODIFIED_TOKEN="${TOKEN}modified"

# Try to use modified token
curl -X POST http://localhost:8081/api/orders \
  -H "Authorization: Bearer $MODIFIED_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"C1","totalAmount":100,"currency":"USD","items":[{"productId":"P1","quantity":1}]}'

# Should return 401 (invalid signature)
```

### 3. CORS Protection
Try to access from unauthorized origin:
```bash
curl -X POST http://localhost:8086/auth/login \
  -H "Origin: http://malicious.com" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Should be blocked by CORS
```

## Performance Testing

### Load Test Registration:
```bash
# Install Apache Bench if needed: brew install httpd (macOS)
ab -n 100 -c 10 -p register.json -T application/json \
  http://localhost:8086/auth/register
```

Where `register.json`:
```json
{"username":"loadtest1","email":"load1@test.com","password":"pass123"}
```

### Load Test Order Creation:
```bash
# First get token
TOKEN=$(./get-token.sh)

# Then load test
ab -n 1000 -c 50 \
  -H "Authorization: Bearer $TOKEN" \
  -p order.json -T application/json \
  http://localhost:8081/api/orders
```

## Test Results Checklist

- [x] User registration works
- [x] Login returns valid JWT
- [x] JWT contains username and roles
- [x] Protected endpoints require JWT
- [x] Invalid tokens are rejected
- [x] Expired tokens are rejected
- [x] Role-based access control works
- [x] Passwords are encrypted (BCrypt)
- [x] CORS protection active
- [x] Frontend login/register UI works
- [x] Frontend stores and uses JWT
- [x] Frontend redirects if unauthenticated
- [x] Logout clears token and redirects

## Common Issues & Solutions

**Issue:** 401 on order creation
- **Solution:** Check if JWT is in Authorization header, verify token not expired

**Issue:** CORS errors in frontend
- **Solution:** Ensure origin is `http://localhost:3000` in SecurityConfig

**Issue:** Integration tests fail
- **Solution:** Ensure Docker is running (Testcontainers needs Docker)

**Issue:** Token not persisting across browser refresh
- **Solution:** Check localStorage in browser DevTools

---

**All tests passing = System is production-ready! ✅**
