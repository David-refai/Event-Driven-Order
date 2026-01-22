#!/bin/bash
# Register
curl -s -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_hs256_final","email":"final@example.com","password":"password123"}' > /dev/null

# Login and capture token
RESPONSE=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_hs256_final","password":"password123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Got Token: $TOKEN"
echo "Token Header: $(echo $TOKEN | cut -d. -f1 | base64 -d)"

# Create Order
curl -v -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"customerId":"customer1","totalAmount":100.50,"currency":"USD","items":[{"productId":"prod1","quantity":2,"price":50.25}]}'
