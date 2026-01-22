#!/bin/bash
# Clean previous user
curl -s -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"cors_tester","email":"cors@example.com","password":"password123"}' > /dev/null

# Login
RESPONSE=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cors_tester","password":"password123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Test CORS
echo "Testing CORS..."
curl -v -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: http://localhost:3000" \
  -d '{"customerId":"cors_cust","totalAmount":10.0,"currency":"USD","items":[]}' 2>&1 | grep "Access-Control-Allow-Origin"
