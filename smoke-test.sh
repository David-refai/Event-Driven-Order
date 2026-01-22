#!/bin/bash

# Configuration
API_KEY="secret-api-key"
BASE_URL="http://localhost:8081"
ANALYTICS_URL="http://localhost:8085"

echo "------------------------------------------------"
echo "Starting Order Processing System Smoke Test"
echo "------------------------------------------------"

# 1. Create a Successful Order
echo -e "\n1. Creating a successful order (Amount <= 500)..."
CREATE_SUCCESS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "customerId": "cust123",
    "totalAmount": 250.00,
    "currency": "USD",
    "items": [
      {"productId": "prod-A", "quantity": 2},
      {"productId": "prod-B", "quantity": 1}
    ]
  }')

ORDER_ID_SUCCESS=$(echo $CREATE_SUCCESS_RESPONSE | grep -o '"orderId":"[^"]*' | cut -d'"' -f4)
echo "Order Created with ID: $ORDER_ID_SUCCESS"

# Wait for events to propagate
echo "Waiting for systems to process events (5s)..."
sleep 5

echo -e "\nChecking Order Status..."
curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID_SUCCESS" -H "X-API-KEY: $API_KEY" | grep -o '"status":"[^"]*' | cut -d'"' -f4

# 2. Create a Failing Order (Payment Fail)
echo -e "\n2. Creating a failing order (Amount > 500)..."
CREATE_FAIL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $API_KEY" \
  -d '{
    "customerId": "cust999",
    "totalAmount": 1000.00,
    "currency": "USD",
    "items": [
      {"productId": "prod-Premium", "quantity": 1}
    ]
  }')

ORDER_ID_FAIL=$(echo $CREATE_FAIL_RESPONSE | grep -o '"orderId":"[^"]*' | cut -d'"' -f4)
echo "Order Created with ID: $ORDER_ID_FAIL"

# Wait for events to propagate
echo "Waiting for systems to process events (5s)..."
sleep 5

echo -e "\nChecking Order Status..."
curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID_FAIL" -H "X-API-KEY: $API_KEY" | grep -o '"status":"[^"]*' | cut -d'"' -f4

# 3. Check Analytics
echo -e "\n3. Checking Analytics Stats..."
curl -s -X GET "$ANALYTICS_URL/api/analytics/stats" | python3 -m json.tool

echo -e "\n------------------------------------------------"
echo "Smoke Test Completed"
echo "------------------------------------------------"
