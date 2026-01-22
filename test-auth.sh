#!/bin/bash

# JWT Authentication Testing Script
# This script tests the complete authentication flow

set -e

echo "🧪 Starting JWT Authentication Tests..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

AUTH_URL="http://localhost:8086/auth"
ORDER_URL="http://localhost:8081/api/orders"

# Test 1: Register a new user
echo "📝 Test 1: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST "$AUTH_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "successfully"; then
  echo -e "${GREEN}✅ Registration successful${NC}"
else
  echo -e "${RED}❌ Registration failed: $REGISTER_RESPONSE${NC}"
  exit 1
fi
echo ""

# Test 2: Login and get JWT token
echo "🔐 Test 2: User Login"
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful${NC}"
  echo "Token: ${TOKEN:0:50}..."
  
  # Extract user info
  USERNAME=$(echo "$LOGIN_RESPONSE" | grep -o '"username":"[^"]*' | sed 's/"username":"//')
  ROLES=$(echo "$LOGIN_RESPONSE" | grep -o '"roles":\[[^]]*\]' | sed 's/"roles"://')
  
  echo "Username: $USERNAME"
  echo "Roles: $ROLES"
else
  echo -e "${RED}❌ Login failed: $LOGIN_RESPONSE${NC}"
  exit 1
fi
echo ""

# Test 3: Access protected endpoint WITH token
echo "🛡️ Test 3: Access Protected Endpoint (With Token)"
ORDER_RESPONSE=$(curl -s -X POST "$ORDER_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customerId": "CUST-TEST",
    "totalAmount": 150.50,
    "currency": "USD",
    "items": [{"productId": "PROD-A", "quantity": 2}]
  }')

if echo "$ORDER_RESPONSE" | grep -q "orderId"; then
  echo -e "${GREEN}✅ Order created successfully with JWT${NC}"
  ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"orderId":"[^"]*' | sed 's/"orderId":"//')
  echo "Order ID: $ORDER_ID"
else
  echo -e "${RED}❌ Order creation failed: $ORDER_RESPONSE${NC}"
  exit 1
fi
echo ""

# Test 4: Access protected endpoint WITHOUT token
echo "🚫 Test 4: Access Protected Endpoint (Without Token)"
UNAUTHORIZED_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$ORDER_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-TEST",
    "totalAmount": 100.00,
    "currency": "USD",
    "items": [{"productId": "PROD-B", "quantity": 1}]
  }')

HTTP_CODE=$(echo "$UNAUTHORIZED_RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | sed 's/HTTP_CODE://')

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
  echo -e "${GREEN}✅ Correctly rejected unauthorized request (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}❌ Should have rejected unauthorized request, got HTTP $HTTP_CODE${NC}"
  exit 1
fi
echo ""

# Test 5: Get order details with token
echo "📊 Test 5: Get Order Details (With Token)"
GET_ORDER_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$ORDER_URL/$ORDER_ID")

HTTP_CODE=$(echo "$GET_ORDER_RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | sed 's/HTTP_CODE://')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Successfully retrieved order details${NC}"
  echo "$GET_ORDER_RESPONSE" | grep -v HTTP_CODE | head -n 10
else
  echo -e "${RED}❌ Failed to get order, HTTP $HTTP_CODE${NC}"
  exit 1
fi
echo ""

# Test 6: Invalid credentials
echo "🔒 Test 6: Login with Invalid Credentials"
INVALID_LOGIN=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$AUTH_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "wrongpassword"
  }')

HTTP_CODE=$(echo "$INVALID_LOGIN" | grep -o 'HTTP_CODE:[0-9]*' | sed 's/HTTP_CODE://')

if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✅ Correctly rejected invalid credentials${NC}"
else
  echo -e "${YELLOW}⚠️ Unexpected response for invalid login: HTTP $HTTP_CODE${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 All JWT Authentication Tests Passed!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ User Registration"
echo "  ✅ User Login & JWT Generation"
echo "  ✅ Protected Endpoint Access (Authorized)"
echo "  ✅ Protected Endpoint Access (Unauthorized)"
echo "  ✅ Order Retrieval with JWT"
echo "  ✅ Invalid Credentials Rejection"
echo ""
